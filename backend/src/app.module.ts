import { Module } from "@nestjs/common";
import { ChatModule } from "./chat/chat.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { RoomModule } from "./room/room.module";
import { CaslModule } from "./casl/casl.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "..", "dist", "client"),
      exclude: ["/api*"],
    }),
    RoomModule,
    CaslModule,
    UserModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
