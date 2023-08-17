import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Protecting endpoints from receiving incorrect data
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: "http://localhost:8080", // add ip address to access the server
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

  ConfigModule.forRoot({
    envFilePath: "../../.env",
  });

  // Use Cookie
  app.use(cookieParser());
  app.setGlobalPrefix("api");
  await app.listen(3000);
}
bootstrap();
