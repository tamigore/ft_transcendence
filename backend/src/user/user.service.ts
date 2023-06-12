import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import { ModifyUserDto } from "./dto";
// import * as argon from "argon2/argon2";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async modifyUser(dto: ModifyUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException("Access Denied");
    if (dto.cmd === "socketId") this.setSocket(user, dto.value);
    if (dto.cmd === "description") this.setDescription(user, dto.value);
    if (dto.cmd === "hash") this.setHash(user, dto.value);
    if (dto.cmd === "hashRT") this.setHashRT(user, dto.value);
    if (dto.cmd === "username") this.setUsername(user, dto.value);
    console.log("User modified: ", user);
  }

  async getUser(dto: User): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException("Access Denied");
    return user;
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

  async setUsername(dto: User, newUsername: string) {
    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        socketId: newUsername,
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

  async setSocket(dto: User, newSocketId: string) {
    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        socketId: newSocketId,
      },
    });
  }
}
