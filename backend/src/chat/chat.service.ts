/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Message } from "@prisma/client";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(message: Message) {
    await this.prisma.message
      .create({
        data: {
          username: message.username,
          object: message.object,
          text: message.text,
          channel: message.channel,
        },
      })
      .catch((error: any) => {
        console.log(error);
        throw new Error(error);
      });
  }

  async getMessages() : Promise<Message[]> {
    const messages = await this.prisma.message.findMany({});
    if (!messages) throw new ForbiddenException("Access Denied");
    return messages;
  }

  async getUserMessages(user: string) : Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        username: user
      }
    });
    if (!messages) throw new ForbiddenException("Access Denied");
    return messages;
  }

  async getMessageID(id: any) : Promise<Message[]> {
    const message = await this.prisma.message.findMany({
      where: {
        id: id
      }
    });
    if (!message) throw new ForbiddenException("Access Denied");
    return message;
  }
}
