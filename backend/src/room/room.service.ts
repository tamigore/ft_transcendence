import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Room } from "@prisma/client";

@Injectable()
export class RoomService implements OnModuleInit {
  private logger: Logger = new Logger("RoomService");
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    const general = await this.prisma.room.findFirst({ where: { id: 1 } });
    if (!general || !general.id) {
      await this.prisma.room
        .create({
          data: {
            name: "general",
            description: "General chat room",
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
  }

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

  async update(userId: number, roomDto: Room) {
    this.logger.log(`user id : ${userId} wants to room: ${roomDto}`);
    await this.prisma.room
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
      .then((room) => {
        this.logger.log("addUser success: ", room);
      })
      .catch((error) => {
        this.logger.error("addUser error: ", error);
        throw new Error(error);
      });
  }

  async addAdmin(roomId: number, userId: number) {
    this.logger.log(`Add user: ${userId} to room: ${roomId}`);
    await this.prisma.room
      .update({
        where: { id: roomId },
        data: {
          admins: {
            connect: [
              {
                id: userId,
              },
            ],
          },
        },
        include: {
          admins: true,
        },
      })
      .then((room) => {
        this.logger.log("addUser success: ", room);
      })
      .catch((error) => {
        this.logger.error("addUser error: ", error);
        throw new Error(error);
      });
  }

  async remove(userId: number, roomId: number): Promise<Room> {
    this.logger.log(`user id : ${userId} wants to removeById: ${roomId}`);
    await this.prisma.room
      .update({
        where: { id: roomId },
        data: {
          users: {
            set: [],
          },
          admins: {
            set: [],
          },
          owner: {
            disconnect: true,
          },
          messages: {
            set: [],
          },
        },
      })
      .then((user) => {
        this.logger.log("remove update success: ", user);
      })
      .catch((error) => {
        this.logger.error("remove update error: ", error);
        throw new Error(error);
      });
    return await this.prisma.room.delete({
      where: { id: roomId },
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
