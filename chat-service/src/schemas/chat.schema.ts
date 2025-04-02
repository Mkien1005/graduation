// src/chat/schemas/chat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Chat extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ type: [{ user: String, bot: String, timestamp: Date }] })
  messages: { user: string; bot: string; timestamp: Date }[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
