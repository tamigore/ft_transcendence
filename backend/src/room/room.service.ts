import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Room, User } from "@prisma/client";
import * as RoomTypes from "./dto/types";

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
          this.logger.log("onModuleInit create success: ", user);
        })
        .catch((error) => {
          this.logger.error("onModuleInit create error: ", error);
        });
    }
  }

  higherRights(
    room: RoomTypes.RoomWithAll,
    userId: number,
    pawnId: number,
  ): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.users != "undefined" &&
      room.users &&
      room.users.length &&
      room.users.find((x: User) => x.id === pawnId) &&
      ((room.owner && room.owner.id === userId) ||
        (typeof room.admins != "undefined" &&
          room.admins &&
          room.admins.length &&
          room.admins.find((x: User) => x.id == userId) &&
          room.owner &&
          room.owner.id &&
          room.owner.id !== pawnId))
    )
      return true;
    return false;
  }

  isOwner(room: RoomTypes.RoomWihtOwner, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.owner != "undefined" &&
      room.owner &&
      room.owner.id &&
      room.owner.id === userId
    )
      return true;
    return false;
  }

  isAdmin(room: RoomTypes.RoomWithAdmins, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.admins != "undefined" &&
      room.admins &&
      room.admins.length &&
      room.admins.find((x: User) => x.id === userId)
    )
      return true;
    return false;
  }

  isUser(room: RoomTypes.RoomWithUsers, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.users != "undefined" &&
      room.users &&
      room.users.length &&
      room.users.find((x: User) => x.id === userId)
    )
      return true;
    return false;
  }

  isBan(room: RoomTypes.RoomWithBan, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.ban != "undefined" &&
      room.ban &&
      room.ban.length &&
      room.ban.find((x: User) => x.id === userId)
    )
      return true;
    return false;
  }

  isMute(room: RoomTypes.RoomWithMute, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.mute != "undefined" &&
      room.mute &&
      room.mute.length &&
      room.mute.find((x: User) => x.id === userId)
    )
      return true;
    return false;
  }

  async findAll(): Promise<Room[]> {
    this.logger.log("findAll rooms");
    return await this.prisma.room.findMany();
  }

  async findAllIncludes(): Promise<Room[]> {
    this.logger.log("findAll Include rooms");
    return await this.prisma.room.findMany({
      include: {
        owner: true,
        admins: true,
        users: true,
        ban: true,
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
          users: {
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

  async findPrivateRooms(userId: number): Promise<Room[]> {
    await this.prisma.room
      .findMany({
        where: {
          private: true,
          users: {
            every: {
              id: userId,
            },
          },
        },
      })
      .then((rooms) => {
        this.logger.log("findPrivateRooms success");
        return rooms;
      })
      .catch((error) => {
        throw error;
      });
    return [];
  }

  async getPrivateRoom(user1: User, user2: User): Promise<Room> {
    this.logger.log(
      `getPrivateRoom of ${user1.username} and ${user2.username}`,
    );
    await this.prisma
      .$transaction(async (prisma) => {
        await prisma.room
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
            this.logger.log(
              "getPrivateRoom findMany failed with error: " + error,
            );
            return await prisma.room.create({
              data: {
                name: `${user1.username} & ${user2.username} Room`,
                description: `User ${user1.username} and ${user2.username} private room`,
                private: true,
                users: {
                  connect: [{ id: user1.id }, { id: user2.id }],
                },
              },
            });
          });
      })
      .then((room) => {
        this.logger.log("getPrivateRoom success: ", room);
        return room;
      })
      .catch((error) => {
        throw new Error(`getPrivateRoom failure: ${error}`);
      });
    return {} as Room;
  }

  async update(userId: number, roomDto: Room) {
    this.logger.log(`user id : ${userId} wants to update room: ${roomDto}`);
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
        throw new Error(error);
      });
  }

  async addUser(roomId: number, userId: number) {
    this.logger.log(`addUser: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            ban: true,
          },
        });
        if (this.isBan(room, userId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await this.prisma.room.update({
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
        });
      })
      .then((room) => {
        this.logger.log("addUser success: ", room);
      })
      .catch((error) => {
        throw new Error(`addUser failure: ${error}`);
      });
  }

  async addAdmin(roomId: number, userId: number, adminId: number) {
    this.logger.log(`addAdmin: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: { owner: true },
        });
        if (!this.isOwner(room, userId))
          throw new Error(`User ${userId} doesn't own room ${roomId}`);
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            admins: {
              connect: [
                {
                  id: adminId,
                },
              ],
            },
          },
          include: {
            admins: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("addAdmin success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async addBan(roomId: number, userId: number, banId: number) {
    this.logger.log(`addBan: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, banId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            ban: {
              connect: [
                {
                  id: banId,
                },
              ],
            },
          },
          include: {
            ban: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("addBan success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async addMute(roomId: number, userId: number, muteId: number) {
    this.logger.log(`addMute: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, muteId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            mute: {
              connect: [
                {
                  id: muteId,
                },
              ],
            },
          },
          include: {
            mute: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("addMute success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async remove(userId: number, roomId: number) {
    this.logger.log(`user id : ${userId} wants to removeById room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: { owner: true },
        });
        if (userId !== room.owner.id)
          throw new Error(`User ${userId} doesn't own room ${roomId}`);
        prisma.room.update({
          where: { id: roomId },
          data: {
            users: {
              set: [],
            },
            admins: {
              set: [],
            },
            ban: {
              set: [],
            },
            mute: {
              set: [],
            },
            owner: {
              disconnect: true,
            },
          },
        });
        prisma.room.delete({
          where: { id: roomId },
        });
      })
      .then((user) => {
        this.logger.log("remove success: ", user);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeUser(roomId: number, userId: number, removeId: number) {
    this.logger.log(`del user: ${userId} from room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        if (userId !== removeId) {
          const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
              owner: true,
              admins: true,
              users: true,
              ban: true,
              mute: true,
              messages: true,
            },
          });
          if (!this.higherRights(room, userId, removeId))
            throw new Error(
              `User ${userId} donesn't have rights on room ${roomId}`,
            );
        }
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            users: {
              disconnect: [
                {
                  id: removeId,
                },
              ],
            },
          },
          include: {
            users: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("removeUser success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeAdmin(roomId: number, userId: number, removeId: number) {
    this.logger.log(`del admin: ${userId} from room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        if (userId !== removeId) {
          const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
              owner: true,
            },
          });
          if (!this.isOwner(room, userId))
            throw new Error(
              `User ${userId} donesn't have rights on room ${roomId}`,
            );
        }
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            admins: {
              disconnect: [
                {
                  id: removeId,
                },
              ],
            },
          },
          include: {
            admins: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("removeAdmin success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeBan(roomId: number, userId: number, banId: number) {
    this.logger.log(`del ban: ${userId} from room: ${roomId}`);
    if (userId === banId) return;
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, banId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            ban: {
              disconnect: [
                {
                  id: banId,
                },
              ],
            },
          },
          include: {
            ban: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("removeBan success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeMute(roomId: number, userId: number, muteId: number) {
    this.logger.log(`del user: ${userId} from room: ${roomId}`);
    if (userId === muteId) return;
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, muteId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            mute: {
              disconnect: [
                {
                  id: muteId,
                },
              ],
            },
          },
          include: {
            mute: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("removeMute success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}
