import { ForbiddenException, Injectable } from "@nestjs/common";
import { Chat } from "./chat.entity";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/binary";

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createMessage(chat: Chat)//: Promise<Chat>
  {
    const res = await this.prisma.chat
      .create({
        data: {
          username: chat.username,
          object: chat.object,
          text: chat.text,
        },
      })
      .catch((error: any) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new ForbiddenException("Credentials incorrect");
          }
        }
        throw error;
      });
    // return res;
  }

  async getMessages()//: Promise<Chat[]>
  {
    // return await this.prisma.chat.findMany();
  }
}
