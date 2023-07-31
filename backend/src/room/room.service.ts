import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Room, User } from "@prisma/client";

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
          this.logger.log("onModuleInit addUser success: ", user);
        })
        .catch((error) => {
          this.logger.error("onModuleInit addUser error: ", error);
        });
    }
  }

  async findAll(): Promise<Room[]> {
    this.logger.log("findAll rooms");
    return await this.prisma.room.findMany();
  }

  async findAllIncludes(): Promise<Room[]> {
    this.logger.log("findAll rooms");
    return await this.prisma.room.findMany({
      include: {
        users: true,
        messages: true,
      },
    });
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

  async getPrivateRoom(user1: User, user2: User): Promise<Room> {
    this.logger.log(
      `getPrivateRoom of ${user1.username} and ${user2.username}`,
    );
    await this.prisma.room
      .findMany({
        where: {
          name: `${user1.username} & ${user2.username} Room`,
        },
      })
      .then((res) => {
        this.logger.log("getPrivateRoom findMany success");
        return res;
      })
      .catch(async (error) => {
        this.logger.log("getPrivateRoom findMany failed with error: " + error);
        await this.prisma.room
          .create({
            data: {
              name: `${user1.username} & ${user2.username} Room`,
              description: `User ${user1.username} and ${user2.username} private room`,
              users: {
                connect: [{ id: user1.id }, { id: user2.id }],
              },
            },
          })
          .then((res) => {
            return res;
          })
          .catch((err) => {
            throw err;
          });
      });
    return {} as Room;
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
        this.logger.log("addAdmin success: ", room);
      })
      .catch((error) => {
        this.logger.error("addAdmin error: ", error);
        throw new Error(error);
      });
  }

  async remove(userId: number, roomId: number) {
    this.logger.log(`user id : ${userId} wants to removeById: ${roomId}`);
    await this.prisma
      .$transaction([
        this.prisma.room.update({
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
              set: [], // TODO: remove without "The change you are trying to make would violate the required relation 'MessageToRoom' between the `Message` and `Room` models."
            },
          },
        }),
        this.prisma.room.delete({
          where: { id: roomId },
        }),
      ])
      .then((user) => {
        this.logger.log("remove success: ", user);
      })
      .catch((error) => {
        this.logger.error("remove error: ", error);
        throw new Error(error);
      });
  }

  async removeUser(roomId: number, userId: number) {
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
