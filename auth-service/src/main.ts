import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Authorization'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(3001);
}
bootstrap();
