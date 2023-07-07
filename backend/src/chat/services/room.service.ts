// import { Injectable } from "@nestjs/common";
// import { User, Room } from "@prisma/client";
// import { PrismaService } from "src/prisma/prisma.service";

// @Injectable()
// export class RoomService {
//   constructor(private prisma: PrismaService) {}

//   async createRoom(room: Room, creator: User): Promise<Room> {
//     const newRoom = await this.addCreatorToRoom(room, creator);
//     return this.prisma.room.create({
//       data: {
//         name: room.name,
//         description: room.description,
//         users: room.users,
//         joinedUsers: room.joinedUsers,
//         messages: room.messages,
//       },
//     });
//   }

//   async getRoom(roomId: number): Promise<Room> {
//     return this.prisma.room.find(roomId, {
//       relations: ["users"],
//     });
//   }

//   async getRoomsForUser(userId: number): Promise<Room[]> {
//     return this.prisma.room.findMany({
//       where: {
//         users: userId,
//       },
//     });
//   }

//   async addCreatorToRoom(room: Room, creator: User): Promise<Room> {
//     room.users.push(creator);
//     return room;
//   }
// }
