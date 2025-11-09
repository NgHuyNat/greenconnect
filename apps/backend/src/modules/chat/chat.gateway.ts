import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ChatService, SendMessageDto } from "./chat.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        console.log("Unauthorized: No token provided");
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub; // JWT payload uses 'sub' not 'id'

      this.connectedUsers.set(userId, client);
      client.join(`user_${userId}`);

      console.log(`User ${userId} connected to chat`);
    } catch (error) {
      console.log("Unauthorized connection attempt:", error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove the disconnected user
    for (const [userId, socket] of this.connectedUsers.entries()) {
      if (socket.id === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected from chat`);
        break;
      }
    }
  }

  @SubscribeMessage("send_message")
  async handleMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      const senderId = payload.sub; // JWT payload uses 'sub' not 'id'

      const message = await this.chatService.sendMessage(data, senderId);

      // Get conversation participants to send message to both users
      const conversation = await this.chatService[
        "conversationRepository"
      ].findOne({
        where: { id: data.conversationId },
        relations: ["participant1", "participant2"],
      });

      if (conversation) {
        // Send to both participants with proper structure
        const payload = {
          message,
          conversationId: data.conversationId,
        };

        this.server
          .to(`user_${conversation.participant1.id}`)
          .to(`user_${conversation.participant2.id}`)
          .emit("new_message", payload);
      }

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage("join_conversation")
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      const userId = payload.sub; // JWT payload uses 'sub' not 'id'

      // Verify user is participant in this conversation
      const conversation = await this.chatService[
        "conversationRepository"
      ].findOne({
        where: { id: data.conversationId },
        relations: ["participant1", "participant2"],
      });

      if (
        conversation &&
        (conversation.participant1.id === userId ||
          conversation.participant2.id === userId)
      ) {
        client.join(`conversation_${data.conversationId}`);
        return { success: true };
      } else {
        return {
          success: false,
          error: "Not authorized to join this conversation",
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage("leave_conversation")
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.leave(`conversation_${data.conversationId}`);
    return { success: true };
  }
}
