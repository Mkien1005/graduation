import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { MailModule } from '../mail/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Cho phép sử dụng biến môi trường toàn cục
      cache: true,
      //load: [AppConfig, DatabaseConfig],
      envFilePath: ['.env.local', '.env.dev', '.env.prod', '.env'],
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        publicKey: configService.get('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
        privateKey: configService.get('JWT_PRIVATE_KEY').replace(/\\n/g, '\n'),
        signOptions: {
          expiresIn: parseInt(configService.get('JWT_ACCESS_TOKEN_EXPIRATION')),
          algorithm: 'RS256',
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
