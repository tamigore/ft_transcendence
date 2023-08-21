import {
  Param,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Message } from "@prisma/client";
import { AtGuard } from "src/common/guards";
import { GetCurrentUserId, Public } from "src/common/decorators";

@Controller("chat")
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get("room/:id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async getChannelMessages(
    @GetCurrentUserId() id: number,
    @Param("id") param: string,
  ): Promise<Message[]> {
    const roomId: number = parseInt(param);
    return await this.chatService.getRoomMessages(id, roomId);
  }

  @Public()
  @Get("user/:id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async getUserMessages(@Param("id") param: string): Promise<Message[]> {
    const userId: number = parseInt(param);
    return await this.chatService.getUserMessages(userId);
  }

  @Get()
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async getMessages(): Promise<Message[]> {
    return await this.chatService.getMessages();
  }
}
