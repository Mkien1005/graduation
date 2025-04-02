import { Module } from '@nestjs/common';
import { ChatController } from './app.controller';
import { ChatService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Session, SessionSchema } from './schemas/session.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    HttpModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class AppModule {}
