import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
