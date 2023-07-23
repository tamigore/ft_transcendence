import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { UserService } from "src/user/user.service";
import { RoomService } from "src/room/room.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  providers: [ChatGateway, ChatService, UserService, RoomService, JwtService],
  controllers: [ChatController],
})
export class ChatModule {}
