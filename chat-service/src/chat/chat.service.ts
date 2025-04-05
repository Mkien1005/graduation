import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session } from './schemas/session.schema';
import { Message } from './schemas/message.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
    res: any,
  ): Promise<{ userMessage: Message; ragMessage: Message }> {
    // Kiểm tra session
    let session;
    if (!sessionId) {
      // Nếu không tìm thấy session thì tạo mới
      session = new this.sessionModel({
        userId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        // Thêm trường khác nếu có (vd: topic, title,...)
      });
      await session.save();
    } else {
      // Nếu có sessionId thì tìm kiếm session

      session = await this.sessionModel.findOne({
        _id: sessionId,
        userId,
      });
    }

    // Lưu tin nhắn của người dùng
    const userMessage = new this.messageModel({
      sessionId: session._id,
      content,
      sender: 'user',
    });
    await userMessage.save();
    console.log('1 :>> ', this.configService.get('RAG_MODULE_URL'));
    // Gọi FastAPI với streaming
    const ragResponseStream = await this.callRagModelWithStreaming(
      userId,
      content,
    );

    // Tích lũy nội dung từ stream
    let ragContent = '';
    for await (const chunk of ragResponseStream) {
      ragContent += chunk;
      // Tích lũy nội dung từ stream và gửi từng chunk qua SSE
      res.write(`${chunk}`);
    }
    res.end(); // Kết thúc stream khi hoàn tất
    // Lưu phản hồi của RAG sau khi stream hoàn tất
    const ragMessage = new this.messageModel({
      sessionId: session._id,
      content: ragContent,
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

  private async *callRagModelWithStreaming(
    userId: string, // Thêm userId vào đây nếu cần
    content: string,
  ): AsyncIterableIterator<string> {
    const url = this.configService.get('RAG_MODULE_URL'); // Thay bằng URL của FastAPI
    const body = {
      message: content,
      history: [], // Có thể lấy lịch sử từ session nếu cần
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new BadRequestException(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      yield chunk; // Trả về từng chunk
    }
  }

  // Lấy tất cả tin nhắn trong một phiên
  async getMessages(sessionId: string, userId: string): Promise<Message[]> {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId,
    });
    if (!session) {
      throw new BadRequestException('Session not found or not authorized');
    }
    console.log('session :>> ', session);
    return await this.messageModel
      .find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .populate('sessionId') // Ánh xạ dữ liệu liên kết với session
      .exec();
  }
}
