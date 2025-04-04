// src/chat/dto/create-chat.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateChatDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  message: string;
}
