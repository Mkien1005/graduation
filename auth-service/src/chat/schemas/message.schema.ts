import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  sessionId: Types.ObjectId; // Liên kết với phiên hội thoại

  @Prop({ required: true })
  content: string; // Nội dung tin nhắn (câu hỏi hoặc câu trả lời)

  @Prop({ required: true, enum: ['user', 'rag'] })
  sender: 'user' | 'rag'; // Người gửi: 'user' (người dùng) hoặc 'rag' (mô hình RAG)

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
