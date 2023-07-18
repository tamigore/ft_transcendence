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
}
