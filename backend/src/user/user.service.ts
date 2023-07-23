import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UserService {
  private logger: Logger = new Logger("UserService");
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async findAll(): Promise<User[]> {
    this.logger.log(`findAll users`);
    return await this.prisma.user.findMany();
  }

  async findById(id: number): Promise<User> {
    this.logger.log(`findById user: ${id}`);
    return await this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async findByChatSocket(socket: string): Promise<User> {
    this.logger.log(`findByChatSocket : ${socket}`);
    return await this.prisma.user.findFirst({
      where: { chatSocket: socket },
    });
  }

  async update(userId: number, updateUserDto: any) {
    this.logger.log(
      `user id : ${userId} wants to update user: ${updateUserDto}`,
    );
    await this.prisma.user
      .update({
        where: { id: userId },
        data: {
          email: updateUserDto.email,
          username: updateUserDto.username,
          loggedIn: updateUserDto.loggedIn,
          bio: updateUserDto.bio,
          img: updateUserDto.img,
        },
      })
      .then((user) => {
        this.logger.log("User update success: ", user);
      })
      .catch((error) => {
        this.logger.error("User update error: ", error);
      });
  }

  async updateChatSocket(userId: number, chatSocket: string) {
    this.logger.log(
      `user id : ${userId} wants to update chatSocket: ${chatSocket}`,
    );
    await this.prisma.user
      .update({
        where: { id: userId },
        data: {
          chatSocket: chatSocket,
        },
      })
      .then((user) => {
        this.logger.log("chatSocket update success: ", user);
      })
      .catch((error) => {
        this.logger.error("chatSocket update error: ", error);
      });
  }

  async remove(userId: number, id: number): Promise<User> {
    this.logger.log(`user id : ${userId} wants to removeById: ${id}`);
    return await this.prisma.user.delete({
      where: { id: id },
    });
  }
}
