import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import { ModifyUserDto } from "./dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async modifyUser(dto: ModifyUserDto) {
    console.log("modifyUser dto: ", dto);
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException("Access Denied");
    // if (dto.cmd === "chatSocket") this.setChatSocket(user, dto.value);
    // if (dto.cmd === "gameSocket") this.setGameSocket(user, dto.value);
    // if (dto.cmd === "rooms") this.setRooms(user, dto.value);
    if (dto.cmd === "description") this.setDescription(user, dto.value);
    if (dto.cmd === "hash") this.setHash(user, dto.value);
    if (dto.cmd === "hashRT") this.setHashRT(user, dto.value);
    if (dto.cmd === "username") this.setUsername(user, dto.value);
    console.log("User modified: ", user);
  }

  async getUser(dto): Promise<User> {
    console.log("getUser dto: ", dto);
    if (dto === undefined) throw new ForbiddenException("Access Denied");
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException("Access Denied");
    return user;
  }

  async getUsers(dto): Promise<User[]> {
    console.log("getUsers dto: ", dto);
    if (dto === undefined) throw new ForbiddenException("Access Denied");
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { id: dto.id },
          { created_at: dto.created_at },
          { updated_at: dto.updated_at },
          { email: dto.email },
          { username: dto.username },
          { description: dto.description },
          { hash: dto.hash },
          { hashedRt: dto.hashedRt },
          // { chatSocket: dto.chatSocket },
          // { gameSocket: dto.gameSocket },
          // { role: dto.role },
          { loggedIn: dto.loggedIn },
        ],
      },
    });
    if (!users) throw new ForbiddenException("Access Denied");
    return users;
  }

  async setDescription(dto: User, newDescription: string) {
    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        description: newDescription,
      },
    });
  }

  async getHash(reqHash: string): Promise<User> {
    console.log("getHash: ", reqHash);
    if (reqHash === undefined) throw new ForbiddenException("Access Denied with no request");
    const user = await this.prisma.user.findUnique({
      where: {
        hash: reqHash,
      },
    });
    if (!user) throw new ForbiddenException("Access Denied with no user found");
    return user;
  }

  async setUsername(dto: User, newUsername: string) {
    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        username: newUsername,
      },
    });
  }

  async setHash(dto: User, newHash: string) {
    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        hash: newHash,
      },
    });
  }

  async setHashRT(dto: User, newHashRT: string) {
    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        hashedRt: newHashRT,
      },
    });
  }

  // async setRooms(socketId: string, newRoom: string) {
  //   await this.prisma.user.update({
  //     where: {
  //       chatSocket: socketId,
  //     },
  //     data: {
  //       rooms: {
  //         push: newRoom,
  //       },
  //     },
  //   });
  // }

  // async setChatSocket(dto: User, newchatSocket: string) {
  //   await this.prisma.user.update({
  //     where: {
  //       email: dto.email,
  //     },
  //     data: {
  //       chatSocket: newchatSocket,
  //     },
  //   });
  // }

  // async setGameSocket(dto: User, newGameSocket: string) {
  //   await this.prisma.user.update({
  //     where: {
  //       email: dto.email,
  //     },
  //     data: {
  //       gameSocket: newGameSocket,
  //     },
  //   });
  // }
}
