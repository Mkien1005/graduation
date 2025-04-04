import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://phungmanhkien20:SMixxGAQoTLS3x0Q@chat.xnxw9gh.mongodb.net/?retryWrites=true&w=majority&appName=Chat',
    ),
    ChatModule,
  ],
})
export class AppModule {}
