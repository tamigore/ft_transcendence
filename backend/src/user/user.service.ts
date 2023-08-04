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
    return await this.prisma.user
      .findUnique({
        where: { id: id },
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async findAllButSelf(userId: number): Promise<User[]> {
    this.logger.log(`findAllButSelf user: ${userId}`);
    const users = await this.prisma.user.findMany({
      where: {
        NOT: {
          id: userId,
        },
      },
    });
    return users;
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
        throw new Error(error);
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
        throw new Error(error);
      });
  }

  async addFriends(userId: number, friendId: number) {
    this.logger.log(
      `user id : ${userId} wants to update chatSocket: ${friendId}`,
    );
    await this.prisma
      .$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { friend: { connect: { id: friendId } } },
        }),
        this.prisma.user.update({
          where: { id: friendId },
          data: { friend: { connect: { id: userId } } },
        }),
      ])
      .then((user) => {
        this.logger.log("addFriends success: ", user);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeFriends(userId: number, friendId: number) {
    this.logger.log(
      `user id : ${userId} wants to update chatSocket: ${friendId}`,
    );
    await this.prisma
      .$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { friend: { disconnect: { id: friendId } } },
        }),
        this.prisma.user.update({
          where: { id: friendId },
          data: { friend: { disconnect: { id: userId } } },
        }),
      ])
      .then((user) => {
        this.logger.log("addFriends success: ", user);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async findFriendsById(userId: number) {
    this.logger.log(`findFriendById user: ${userId}`);
    const users = await this.prisma.user.findMany({
      where: {
        id: userId,
      },
      include: {
        friend: true,
      },
    });
    return users;
  }

  async addBlocked(userId: number, blockedId: number) {
    this.logger.log(
      `user id : ${userId} wants to update chatSocket: ${blockedId}`,
    );
    await this.prisma
      .$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { blocked: { connect: { id: blockedId } } },
        }),
        this.prisma.user.update({
          where: { id: blockedId },
          data: { blocked: { connect: { id: userId } } },
        }),
      ])
      .then((user) => {
        this.logger.log("addBlocked success: ", user);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeBlocked(userId: number, blockedId: number) {
    this.logger.log(
      `user id : ${userId} wants to update chatSocket: ${blockedId}`,
    );
    await this.prisma
      .$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { blocked: { disconnect: { id: blockedId } } },
        }),
        this.prisma.user.update({
          where: { id: blockedId },
          data: { blocked: { disconnect: { id: userId } } },
        }),
      ])
      .then((user) => {
        this.logger.log("addBlocked success: ", user);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}
