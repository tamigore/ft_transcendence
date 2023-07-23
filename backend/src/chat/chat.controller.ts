import { Param, Controller, HttpCode, HttpStatus, Get } from "@nestjs/common";
import { Public } from "../common/decorators";
import { ChatService } from "./chat.service";
import { Message } from "@prisma/client";

@Controller("chat")
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Public()
  @Get("room/:id")
  @HttpCode(HttpStatus.OK)
  async getChannelMessages(@Param("id") param: string): Promise<Message[]> {
    const roomId: number = parseInt(param);
    return await this.chatService.getRoomMessages(roomId);
  }

  @Public()
  @Get("user/:id")
  @HttpCode(HttpStatus.OK)
  async getUserMessages(@Param("id") param: string): Promise<Message[]> {
    const userId: number = parseInt(param);
    return await this.chatService.getUserMessages(userId);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMessages(): Promise<Message[]> {
    return await this.chatService.getMessages();
  }
}
