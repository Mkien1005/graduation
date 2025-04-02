import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session } from './schemas/session.schema';
import { Message } from './schemas/message.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly httpService: HttpService,
  ) {}

  // Tạo một phiên hội thoại mới
  async createSession(userId: string, title?: string): Promise<Session> {
    const session = new this.sessionModel({
      userId,
      title: title || 'Untitled Session',
      messages: [],
    });
    return session.save();
  }

  // Lấy tất cả phiên hội thoại của một người dùng
  async getSessions(userId: string): Promise<Session[]> {
    return this.sessionModel
      .find({ userId })
      .populate('messages')
      .sort({ updatedAt: -1 })
      .exec();
  }

  // Gửi tin nhắn và nhận phản hồi từ mô hình RAG
  async sendMessage(
    userId: string,
    sessionId: string,
    content: string,
  ): Promise<{ userMessage: Message; ragMessage: Message }> {
    // Kiểm tra xem session có tồn tại và thuộc về user không
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId,
    });
    if (!session) {
      throw new Error('Session not found or not authorized');
    }

    // Lưu tin nhắn của người dùng
    const userMessage = new this.messageModel({
      sessionId,
      content,
      sender: 'user',
    });
    await userMessage.save();

    // Gửi tin nhắn đến mô hình RAG qua FastAPI
    const ragResponse = await this.callRagModel(content);

    // Lưu phản hồi của RAG
    const ragMessage = new this.messageModel({
      sessionId: new Types.ObjectId(sessionId),
      content: ragResponse,
      sender: 'rag',
    });
    await ragMessage.save();

    // Cập nhật session với tin nhắn mới
    session.messages.push(
      userMessage._id as Types.ObjectId,
      ragMessage._id as Types.ObjectId,
    );
    session.updatedAt = new Date();
    await session.save();

    return { userMessage, ragMessage };
  }

  // Gọi API của FastAPI để lấy phản hồi từ mô hình RAG
  private async callRagModel(content: string): Promise<string> {
    try {
      const response: any = await firstValueFrom(
        this.httpService.post('http://localhost:8000/rag', { query: content }),
      );
      // return response.data.response; // Giả sử FastAPI trả về { "response": "..." }
      return response.data;
    } catch (error) {
      throw new Error('Failed to get response from RAG model');
    }
  }

  // Lấy tất cả tin nhắn trong một phiên
  async getMessages(sessionId: string, userId: string): Promise<Message[]> {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId,
    });
    if (!session) {
      throw new Error('Session not found or not authorized');
    }

    return this.messageModel.find({ sessionId }).sort({ createdAt: 1 }).exec();
  }
}
