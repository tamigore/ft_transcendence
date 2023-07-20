import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Room } from "@prisma/client";

@Injectable()
export class UserService {
  private logger: Logger = new Logger("UserService");
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async findAll(): Promise<Room[]> {
    return await this.prisma.room.findMany();
  }

  async findById(userId: number, id: number): Promise<Room> {
    this.logger.log(`user id : ${userId} wants to findById: ${id}`);
    return await this.prisma.room.findUnique({
      where: { id: id },
    });
  }

  async update(userId: number, id: number, roomDto: Room) {
    this.logger.log(`user id : ${userId} wants to updateById: ${id}`);
    return await this.prisma.room
      .update({
        where: { id: id },
        data: {
          name: roomDto.name,
          adminId: roomDto.adminId,
          description: roomDto.description,
        },
      })
      .then((user) => {
        this.logger.log("User update success: ", user);
      })
      .catch((error) => {
        this.logger.error("User update error: ", error);
      });
  }

  async addUser(userId: number, id: number, roomDto: Room) {
    this.logger.log(`user id : ${userId} wants to updateById: ${id}`);
    return await this.prisma.room
      .update({
        where: { id: id },
        data: {
          name: roomDto.name,
          adminId: roomDto.adminId,
          description: roomDto.description,
        },
      })
      .then((user) => {
        this.logger.log("User update success: ", user);
      })
      .catch((error) => {
        this.logger.error("User update error: ", error);
      });
  }

  async remove(userId: number, id: number): Promise<Room> {
    this.logger.log(`user id : ${userId} wants to removeById: ${id}`);
    return await this.prisma.room.delete({
      where: { id: id },
    });
  }
}
