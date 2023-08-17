import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AtGuard } from "./common/guards";
import { PrismaModule } from "./prisma/prisma.module";
import { ChatModule } from "./chat/chat.module";
import { UserModule } from "./user/user.module";
import { GameModule } from "./game/game.module";
import { RoomModule } from "./room/room.module";
import { TwoFAModule } from "src/tfa/twoFA.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TwoFAModule,
    AuthModule,
    PrismaModule,
    ChatModule,
    UserModule,
    GameModule,
    RoomModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
