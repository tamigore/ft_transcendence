import {
  Param,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Message } from "@prisma/client";
import { AtGuard } from "src/common/guards";
import { GetCurrentUserId } from "src/common/decorators";

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

  @Get("user/:id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async getUserMessages(
    @GetCurrentUserId() requesterId: number,
    @Param("id", ParseIntPipe) targetId: number,
  ): Promise<Message[]> {
    if (requesterId !== targetId)
      throw new ForbiddenException("Cannot access other users' messages");
    return await this.chatService.getUserMessages(requesterId);
  }

  @Get()
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async getMessages(): Promise<Message[]> {
    return await this.chatService.getMessages();
  }
}
