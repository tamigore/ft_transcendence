import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Protecting endpoints from receiving incorrect data
  app.useGlobalPipes(new ValidationPipe());

  // Voir Kevin, on avait pas supprime ca ?
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:8080/',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  })

  // Use Cookie 
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
