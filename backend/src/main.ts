import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
// import axios, { AxiosResponse, AxiosError } from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  ConfigModule.forRoot({
    envFilePath: "../../.env",
  });
  // Protecting endpoints from receiving incorrect data
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ["http://localhost:8080", `http://${process.env.DOMAIN}:8080`],
    credentials: true,
    // methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    // allowedHeaders: [
    //   "Content-Type",
    //   "Authorization",
    //   "x-csrf-token",
    //   "Origin",
    //   "x-auth-token",
    // ],
  });

  // Use Cookie
  app.use(cookieParser());
  app.setGlobalPrefix("api");
  await app.listen(3000);
}
bootstrap();
