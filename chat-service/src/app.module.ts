import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/test',
        maxPoolSize: 5, // Giới hạn số kết nối
      }),
    }),
    ChatModule,
  ],
})
export class AppModule {}
