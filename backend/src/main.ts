import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigModule } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  // app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: ["http://localhost:8080/", "http://localhost:8080"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  });

  ConfigModule.forRoot({
    envFilePath: "../../.env",
  });

  // app.use(cookieParser());
  app.setGlobalPrefix("api");

  await app.listen(3000);

  // Gracefully shutdown the server.
  app.enableShutdownHooks();
}
bootstrap();
