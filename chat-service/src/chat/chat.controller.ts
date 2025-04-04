import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from './schemas/message.schema';
import { Session } from './schemas/session.schema';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Tạo một phiên hội thoại mới
  @Post('session')
  async createSession(
    @Body('userId') userId: string,
    @Body('title') title?: string,
  ): Promise<Session> {
    return this.chatService.createSession(userId, title);
  }

  // Lấy tất cả phiên hội thoại của người dùng
  @Get('sessions')
  async getSessions(@Query('userId') userId: string): Promise<Session[]> {
    return this.chatService.getSessions(userId);
  }

  // Gửi tin nhắn và nhận phản hồi từ RAG
  @Post('message')
  async sendMessage(
    @Body('userId') userId: string,
    @Body('sessionId') sessionId: string,
    @Body('content') content: string,
  ): Promise<{ userMessage: Message; ragMessage: Message }> {
    return this.chatService.sendMessage(userId, sessionId, content);
  }

  // Lấy tất cả tin nhắn trong một phiên
  @Get('messages/:sessionId')
  async getMessages(
    @Param('sessionId') sessionId: string,
    @Query('userId') userId: string,
  ): Promise<Message[]> {
    return this.chatService.getMessages(sessionId, userId);
  }
}
