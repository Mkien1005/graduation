import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    MongooseModule.forRoot(
      'mongodb+srv://phungmanhkien20:SMixxGAQoTLS3x0Q@chat.xnxw9gh.mongodb.net/?retryWrites=true&w=majority&appName=Chat',
    ),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        publicKey: configService.get('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
      }),
      inject: [ConfigService],
    }),
    ChatModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
