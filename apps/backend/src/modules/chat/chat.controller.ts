import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import {
  ChatService,
  CreateConversationDto,
  SendMessageDto,
} from "./chat.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Chat")
@Controller("chat")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("conversations")
  @ApiOperation({ summary: "Create a new conversation" })
  @ApiResponse({
    status: 201,
    description: "Conversation created successfully",
  })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req
  ) {
    const conversation = await this.chatService.createConversation(
      createConversationDto,
      req.user.id
    );

    // Check if participants are loaded
    if (!conversation.participant1 || !conversation.participant2) {
      throw new Error("Conversation participants not loaded");
    }

    // Format response to match frontend expectations
    const otherParticipant =
      conversation.participant1.id === req.user.id
        ? conversation.participant2
        : conversation.participant1;

    return {
      id: conversation.id,
      otherParticipant,
      lastMessage: null,
      updatedAt: conversation.updatedAt,
    };
  }

  @Get("conversations")
  @ApiOperation({ summary: "Get user's conversations" })
  @ApiResponse({
    status: 200,
    description: "Conversations retrieved successfully",
  })
  async getConversations(@Request() req) {
    const conversations = await this.chatService.getConversations(req.user.id);

    // Format response to match frontend expectations
    return conversations.map((conv) => {
      const otherParticipant =
        conv.participant1.id === req.user.id
          ? conv.participant2
          : conv.participant1;

      // Get the last message from the messages array
      const lastMessage =
        conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;

      return {
        id: conv.id,
        otherParticipant,
        lastMessage,
        updatedAt: conv.updatedAt,
      };
    });
  }

  @Post("messages")
  @ApiOperation({ summary: "Send a message" })
  @ApiResponse({ status: 201, description: "Message sent successfully" })
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req) {
    return this.chatService.sendMessage(sendMessageDto, req.user.id);
  }

  @Get("conversations/:id/messages")
  @ApiOperation({ summary: "Get messages in a conversation" })
  @ApiResponse({ status: 200, description: "Messages retrieved successfully" })
  async getMessages(
    @Param("id") conversationId: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "50",
    @Request() req
  ) {
    return this.chatService.getMessages(
      conversationId,
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );
  }

  @Post("messages/:id/read")
  @ApiOperation({ summary: "Mark message as read" })
  @ApiResponse({ status: 200, description: "Message marked as read" })
  async markAsRead(@Param("id") messageId: string, @Request() req) {
    return this.chatService.markAsRead(messageId, req.user.id);
  }

  @Delete("conversations/:id")
  @ApiOperation({ summary: "Delete a conversation" })
  @ApiResponse({
    status: 200,
    description: "Conversation deleted successfully",
  })
  async deleteConversation(
    @Param("id") conversationId: string,
    @Request() req
  ) {
    return this.chatService.deleteConversation(conversationId, req.user.id);
  }
}
