import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import { ModifyUserDto } from "./dto";

@Injectable()
export class UserService {
  private logger: Logger = new Logger("UserService");
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async modifyUser(dto: ModifyUserDto) {
    this.logger.log("modifyUser dto: ", dto);
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
    this.logger.log("User modified: ", user);
  }

  async getUser(dto): Promise<User> {
    this.logger.log("getUser dto: ", dto);
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
    this.logger.log("getUsers dto: ", dto);
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

  async findByUsername(username: string): Promise<User> {
    this.logger.log("findByUsername: ", username);
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) throw new ForbiddenException("Access Denied with no user found");
    return user;
  }

  async findByID(id: number): Promise<User> {
    this.logger.log("findByID: ", id);
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
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

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findById(userId: number, id: number): Promise<User> {
    this.logger.log(`user id : ${userId} wants to findById: ${id}`);
    return await this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async update(userId: number, id: number, updateUserDto: any) {
    this.logger.log(`user id : ${userId} wants to updateById: ${id}`);
    return await this.prisma.user
      .update({
        where: { id: id },
        data: {
          email: updateUserDto.email,
          username: updateUserDto.username,
          description: updateUserDto.description,
          hash: updateUserDto.hash,
          hashedRt: updateUserDto.hashedRt,
          chatSocket: updateUserDto.chatSocket,
          gameSocket: updateUserDto.gameSocket,
          role: updateUserDto.role,
          loggedIn: updateUserDto.loggedIn,
          profile: updateUserDto.profile,
          rooms: updateUserDto.rooms,
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

  async remove(userId: number, id: number): Promise<User> {
    this.logger.log(`user id : ${userId} wants to removeById: ${id}`);
    return await this.prisma.user.delete({
      where: { id: id },
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
