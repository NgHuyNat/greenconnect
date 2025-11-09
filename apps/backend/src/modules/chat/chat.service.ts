import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "../../common/entities/conversation.entity";
import { Message, MessageType } from "../../common/entities/message.entity";
import { User } from "../../common/entities/user.entity";

export interface CreateConversationDto {
  recipientId: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: string; // Optional field for message type
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createConversation(
    createConversationDto: CreateConversationDto,
    participant1Id: string
  ) {
    // Prevent user from chatting with themselves
    if (participant1Id === createConversationDto.recipientId) {
      throw new ForbiddenException(
        "You cannot create a conversation with yourself"
      );
    }

    // Check if conversation already exists between these users
    const existingConversation = await this.conversationRepository
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.participant1", "participant1")
      .leftJoinAndSelect("conversation.participant2", "participant2")
      .where(
        "(conversation.participant1Id = :p1 AND conversation.participant2Id = :p2) OR (conversation.participant1Id = :p2 AND conversation.participant2Id = :p1)",
        {
          p1: participant1Id,
          p2: createConversationDto.recipientId,
        }
      )
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }

    // Get both users
    const [participant1, participant2] = await Promise.all([
      this.userRepository.findOne({ where: { id: participant1Id } }),
      this.userRepository.findOne({
        where: { id: createConversationDto.recipientId },
      }),
    ]);

    if (!participant1 || !participant2) {
      throw new NotFoundException("User not found");
    }

    const conversation = this.conversationRepository.create({
      participant1,
      participant2,
    });

    return this.conversationRepository.save(conversation);
  }

  async sendMessage(sendMessageDto: SendMessageDto, senderId: string) {
    // Check if conversation exists and user is participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: sendMessageDto.conversationId },
      relations: ["participant1", "participant2"],
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    // Check if user is a participant
    if (
      conversation.participant1.id !== senderId &&
      conversation.participant2.id !== senderId
    ) {
      throw new ForbiddenException(
        "You are not a participant in this conversation"
      );
    }

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    const message = this.messageRepository.create({
      content: sendMessageDto.content,
      type: (sendMessageDto.type as MessageType) || MessageType.TEXT, // Default to TEXT if not provided
      conversation,
      sender,
    });

    // Update conversation's last message time
    await this.conversationRepository.update(conversation.id, {
      updatedAt: new Date(),
    });

    const savedMessage = await this.messageRepository.save(message);

    // Return message with all relations loaded
    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ["sender", "conversation"],
    });
  }

  async getConversations(userId: string) {
    const conversations = await this.conversationRepository
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.participant1", "participant1")
      .leftJoinAndSelect("conversation.participant2", "participant2")
      .where(
        "conversation.participant1Id = :userId OR conversation.participant2Id = :userId",
        { userId }
      )
      .orderBy("conversation.updatedAt", "DESC")
      .getMany();

    // Manually fetch last message for each conversation using findOne with relation
    for (const conversation of conversations) {
      const lastMessage = await this.messageRepository.findOne({
        where: { conversation: { id: conversation.id } },
        relations: ["sender"],
        order: { createdAt: "DESC" },
      });

      conversation.messages = lastMessage ? [lastMessage] : [];
    }

    return conversations;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50
  ) {
    // Check if user is a participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ["participant1", "participant2"],
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (
      conversation.participant1.id !== userId &&
      conversation.participant2.id !== userId
    ) {
      throw new ForbiddenException(
        "You are not a participant in this conversation"
      );
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversation: { id: conversationId } },
      relations: ["sender"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(messageId: string, userId: string) {
    // In a real implementation, you might have a separate table for read status
    // For now, we'll just return success
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: [
        "conversation",
        "conversation.participant1",
        "conversation.participant2",
      ],
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    // Check if user is a participant in the conversation
    if (
      message.conversation.participant1.id !== userId &&
      message.conversation.participant2.id !== userId
    ) {
      throw new ForbiddenException(
        "You are not a participant in this conversation"
      );
    }

    message.isRead = true;
    return this.messageRepository.save(message);
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ["participant1", "participant2"],
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (
      conversation.participant1.id !== userId &&
      conversation.participant2.id !== userId
    ) {
      throw new ForbiddenException(
        "You are not a participant in this conversation"
      );
    }

    // Delete all messages first
    await this.messageRepository.delete({
      conversation: { id: conversationId },
    });

    // Delete the conversation
    await this.conversationRepository.delete(conversationId);

    return { message: "Conversation deleted successfully" };
  }
}
