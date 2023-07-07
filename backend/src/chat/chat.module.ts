import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { UserService } from "src/user/user.service";

@Module({
  providers: [ChatGateway, ChatService, UserService],
  controllers: [ChatController],
})
export class ChatModule {}
