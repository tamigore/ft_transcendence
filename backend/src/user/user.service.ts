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
    return await this.prisma.user.findMany();
  }

  async findById(userId: number, id: number): Promise<User> {
    this.logger.log(`user id : ${userId} wants to findById: ${id}`);
    return await this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async update(userId: number, updateUserDto: any) {
    this.logger.log(
      `user id : ${userId} wants to updateById: ${updateUserDto.id}`,
    );
    await this.prisma.user
      .update({
        where: { id: userId },
        data: {
          email: updateUserDto.email,
          username: updateUserDto.username,
          hash: updateUserDto.hash,
          hashRt: updateUserDto.hashRt,
          chatSocket: updateUserDto.chatSocket,
          gameSocket: updateUserDto.gameSocket,
          loggedIn: updateUserDto.loggedIn,
          bio: updateUserDto.bio,
          img: updateUserDto.img,
          // profile: updateUserDto.profile,
          // admin: updateUserDto.admin,
          // rooms: updateUserDto.rooms,
          // messages: updateUserDto.messages,
          // win: updateUserDto.win,
          // loose: updateUserDto.loose,
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
}
