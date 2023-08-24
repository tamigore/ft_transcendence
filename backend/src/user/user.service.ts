import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import { PrismaUserCreateInput } from "./user-create";

@Injectable()
export class UserService {
  private logger: Logger = new Logger("UserService");
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createUser(user: PrismaUserCreateInput): Promise<User> {
    let tmpUser: User;

    try {
      tmpUser = await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          hash: user.hash,
          hashRt: user.hashRt,
          username: user.username,
          img: user.pictureURL,
        },
      });
      return tmpUser;
    } catch (err) {
      console.log("Error creating user:", err);
      throw err;
    }
  }

  async getTwoFA(userId: number): Promise<string | null> {
    const res = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFA: true },
    });
    if (!res || typeof res === "undefined") return null;
    return res.twoFA;
  }

  async setTwoFA(userId: number, secret: string | null): Promise<boolean> {
    const res = await this.prisma.user.update({
      where: { id: userId },
      data: { twoFA: secret },
    });
    if (!res || typeof res === "undefined") return false;
    return true;
  }

  async findAll(): Promise<User[]> {
    this.logger.log(`findAll users`);
    return await this.prisma.user.findMany().catch((error) => {
      throw new Error(error);
    });
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

  async findWithAllById(id: number) {
    this.logger.log(`findById user: ${id}`);
    return await this.prisma.user
      .findUnique({
        where: { id: id },
        include: {
          friend: true,
          blocked: true,
          rooms: true,
        },
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async findByUsername(name: string): Promise<User> {
    this.logger.log(`findByUsername user: ${name}`);
    return await this.prisma.user
      .findUnique({
        where: { username: name },
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async findAllButSelf(userId: number): Promise<User[]> {
    this.logger.log(`findAllButSelf user: ${userId}`);
    const users = await this.prisma.user
      .findMany({
        where: {
          NOT: {
            id: userId,
          },
        },
      })
      .catch((error) => {
        throw new Error(error);
      });
    return users;
  }

  async findByChatSocket(socket: string): Promise<User> {
    this.logger.log(`findByChatSocket : ${socket}`);
    return await this.prisma.user
      .findFirst({
        where: { chatSocket: socket },
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async update(userId: number, updateUserDto: any): Promise<User> {
    this.logger.log(
      `user id : ${userId} wants to update user: ${updateUserDto}`,
    );
    return await this.prisma.user
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
        return user;
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

  async updateGameSocket(userId: number, gameSocket: string) {
    this.logger.log(
      `user id : ${userId} wants to update gameSocket: ${gameSocket}`,
    );
    await this.prisma.user
      .update({
        where: { id: userId },
        data: {
          gameSocket: gameSocket,
        },
      })
      .then((user) => {
        this.logger.log("gameSocket update success: ", user);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async addFriends(userId: number, friendId: number) {
    this.logger.log(`user id: ${userId} wants to addFriends: ${friendId}`);
    return await this.prisma
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
        return this.prisma.user.findUnique({
          where: { id: userId },
          include: { friend: true },
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeFriends(userId: number, friendId: number) {
    this.logger.log(`user id : ${userId} wants to removeFriends : ${friendId}`);
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
        this.logger.log("removeFriends success: ", user);
        return this.prisma.user.findUnique({
          where: { id: userId },
          include: { friend: true },
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async findFriends(userId: number) {
    this.logger.log(`findFriends user: ${userId}`);
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

  async findBlocked(userId: number) {
    this.logger.log(`findBlocked user: ${userId}`);
    const users = await this.prisma.user.findMany({
      where: {
        id: userId,
      },
      include: {
        blocked: true,
      },
    });
    return users;
  }

  async addBlocked(userId: number, blockedId: number) {
    this.logger.log(`user id : ${userId} wants to addBlocked: ${blockedId}`);
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
        return this.prisma.user.findUnique({
          where: { id: userId },
          include: { blocked: true },
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeBlocked(userId: number, blockedId: number) {
    this.logger.log(`user id : ${userId} wants to removeBlocked: ${blockedId}`);
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
        this.logger.log("removeBlocked success: ", user);
        return this.prisma.user.findUnique({
          where: { id: userId },
          include: { blocked: true },
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}
