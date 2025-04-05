import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  Req,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from './schemas/message.schema';
import { Session } from './schemas/session.schema';
import { Types } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';

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
  async getSessions(@Req() req: any): Promise<Session[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.chatService.getSessions(userId);
  }

  // Gửi tin nhắn và nhận phản hồi từ RAG
  @Post('message')
  async sendMessage(
    // @Body('userId') userId: string,
    @Req() req: any,
    @Res() res: any,
    @Body() body: CreateChatDto,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.chatService.sendMessage(
      userId,
      body.sessionId,
      body.content,
      res,
    );
  }

  // Lấy tất cả tin nhắn trong một phiên
  @Get('messages/:sessionId')
  async getMessages(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
  ): Promise<Message[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }

    if (!Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestException('sessionId không hợp lệ');
    }
    return this.chatService.getMessages(sessionId, userId);
  }
}
