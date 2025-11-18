import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  ConfigModule.forRoot({
    envFilePath: "../../.env",
  });
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ["http://localhost:8080", `http://${process.env.DOMAIN}:8080`],
    credentials: true,
  });

  // Use Cookie
  app.use(cookieParser());
  app.setGlobalPrefix("api");
  await app.listen(3000);
}
bootstrap();
