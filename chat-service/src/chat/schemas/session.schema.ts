import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ required: true })
  userId: string; // ID của người dùng (có thể là email, username, hoặc UUID)

  @Prop({ default: 'Untitled Session' })
  title: string; // Tiêu đề của phiên (có thể để người dùng đặt tên)

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Types.ObjectId[]; // Danh sách các tin nhắn thuộc phiên này

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
