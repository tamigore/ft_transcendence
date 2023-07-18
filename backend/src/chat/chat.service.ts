import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Message } from "@prisma/client";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(message: Message) {
    console.log("createMessage");
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
    console.log("getMessages");
    const messages = await this.prisma.message.findMany({});
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }

  async getUserMessages(user: string) : Promise<Message[]> {
    console.log("getUserMessages");
    const messages = await this.prisma.message.findMany({
      where: {
        username: user
      }
    });
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }

  async getChannelMessages(channel: string) : Promise<Message[]> {
    console.log("getChannelMessages");
    const messages = await this.prisma.message.findMany({
      where: {
        channel: channel
      }
    });
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }
}
