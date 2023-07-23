import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Room } from "@prisma/client";

@Injectable()
export class RoomService {
  private logger: Logger = new Logger("RoomService");
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async findAll(): Promise<Room[]> {
    this.logger.log(`findAll rooms`);
    return await this.prisma.room.findMany();
  }

  async findById(id: number): Promise<Room> {
    this.logger.log(`findById room: ${id}`);
    return await this.prisma.room.findUnique({
      where: { id: id },
    });
  }

  async createRoom(room: Room): Promise<Room> {
    this.logger.log("createRoom: " + room);
    return await this.prisma.room
      .create({
        data: {
          name: room.name,
          owner: {
            connect: {
              id: room.ownerId,
            },
          },
          description: room.description,
        },
      })
      .then((newRoom) => {
        this.logger.log("createRoom success: ", newRoom);
        return newRoom;
      })
      .catch((error) => {
        this.logger.error("createRoom error: ", error);
        throw new Error(error);
      });
  }

  async update(userId: number, roomDto: Room): Promise<Room> {
    this.logger.log(`user id : ${userId} wants to room: ${roomDto}`);
    return await this.prisma.room
      .update({
        where: { id: roomDto.id },
        data: {
          name: roomDto.name,
          description: roomDto.description,
        },
      })
      .then((updatedRoom) => {
        this.logger.log("Room update success: ", updatedRoom);
        return updatedRoom;
      })
      .catch((error) => {
        this.logger.error("Room update error: ", error);
        throw new Error(error);
      });
  }

  async addUser(roomId: number, userId: number) {
    this.logger.log(`Add user: ${userId} to room: ${roomId}`);
    const general = await this.prisma.room.findFirst({ where: { id: 1 } });
    console.log("addUser general: ", general);
    if (general && general.id === 1)
      await this.prisma.room
        .update({
          where: { id: roomId },
          data: {
            users: {
              connect: [
                {
                  id: userId,
                },
              ],
            },
          },
          include: {
            users: true,
          },
        })
        .then((user) => {
          this.logger.log("addUser success: ", user);
        })
        .catch((error) => {
          this.logger.error("addUser error: ", error);
        });
    else
      await this.prisma.room
        .create({
          data: {
            name: "general",
            description: "General chat room",
            users: {
              connect: [
                {
                  id: userId,
                },
              ],
            },
          },
          include: {
            users: true,
          },
        })
        .then((user) => {
          this.logger.log("addUser success: ", user);
        })
        .catch((error) => {
          this.logger.error("addUser error: ", error);
        });
  }

  async remove(userId: number, id: number): Promise<Room> {
    this.logger.log(`user id : ${userId} wants to removeById: ${id}`);
    return await this.prisma.room.delete({
      where: { id: id },
    });
  }

  async delUser(roomId: number, userId: number) {
    this.logger.log(`del user: ${userId} from room: ${roomId}`);
    return await this.prisma.room
      .update({
        where: { id: roomId },
        data: {
          users: {
            disconnect: [
              {
                id: userId,
              },
            ],
          },
        },
      })
      .then((user) => {
        this.logger.log("removeUser success: ", user);
      })
      .catch((error) => {
        this.logger.error("removeUser error: ", error);
      });
  }
}
