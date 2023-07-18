import { Param, Controller, HttpCode, HttpStatus, Get } from "@nestjs/common";
import { Public } from "../common/decorators";
import { ChatService } from "./chat.service";
import { Message } from "@prisma/client";

@Controller("chat")
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Public()
  @Get("channel")
  @HttpCode(HttpStatus.OK)
  async getChannelMessages(@Param("channel") chan: string): Promise<Message[]> {
    return await this.chatService.getChannelMessages(chan);
  }

  @Public()
  @Get("user")
  @HttpCode(HttpStatus.OK)
  async getUserMessages(@Param("user") username: string): Promise<Message[]> {
    return await this.chatService.getUserMessages(username);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMessages(): Promise<Message[]> {
    return await this.chatService.getMessages();
  }
}
