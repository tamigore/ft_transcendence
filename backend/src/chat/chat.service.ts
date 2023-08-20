import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Message } from "@prisma/client";

@Injectable()
export class ChatService {
  private logger: Logger = new Logger("ChatService");
  constructor(private prisma: PrismaService) {}

  async createMessage(message: Message) {
    this.logger.log("createMessage");
    await this.prisma.message
      .create({
        data: {
          text: message.text,
          room: {
            connect: {
              id: message.roomId,
            },
          },
          user: {
            connect: {
              id: message.userId,
            },
          },
        },
      })
      .then((newMessage) => {
        this.logger.log(`createMessage success: ${newMessage}`);
      })
      .catch((error: any) => {
        this.logger.error(error);
      });
  }

  async getMessages(): Promise<Message[]> {
    this.logger.log("getMessages");
    const messages = await this.prisma.message.findMany({});
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    this.logger.log("getUserMessages");
    const messages = await this.prisma.message.findMany({
      where: {
        userId: userId,
      },
    });
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }

  async getRoomMessages(userId: number, roomId: number): Promise<Message[]> {
    this.logger.log("getChannelMessages");
    const messages = await this.prisma.message.findMany({
      where: {
        roomId: roomId,
        user: {
          blocked: {
            every: {
              id: {
                not: userId,
              },
            },
          },
        },
        room: {
          mute: {
            every: {
              id: {
                not: userId,
              },
            },
          },
        },
      },
      include: {
        user: true,
      },
    });
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }
}
