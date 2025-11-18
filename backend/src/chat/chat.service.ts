import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Message } from "@prisma/client";

type CreateMessageInput = Pick<Message, "text" | "roomId" | "userId">;

@Injectable()
export class ChatService {
  private logger: Logger = new Logger("ChatService");
  constructor(private prisma: PrismaService) {}

  async createMessage(message: CreateMessageInput): Promise<Message> {
    this.logger.log("createMessage");
    try {
      return await this.prisma.message.create({
        data: {
          text: message.text,
          room: { connect: { id: message.roomId } },
          user: { connect: { id: message.userId } },
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getMessages() {
    this.logger.log("getMessages");
    const messages = await this.prisma.message.findMany({});
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }

  async getUserMessages(userId: number) {
    this.logger.log("getUserMessages");
    const messages = await this.prisma.message.findMany({
      where: {
        userId: userId,
      },
    });
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }

  async getRoomMessages(userId: number, roomId: number) {
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
      },
      include: {
        user: true,
      },
    });
    if (!messages) throw new ForbiddenException("No messages found");
    return messages;
  }
}
