// import { Injectable } from "@nestjs/common";
// import { Room, User, JoinedRoom } from "@prisma/client";
// import { PrismaService } from "../../prisma/prisma.service";

// @Injectable()
// export class JoinedRoomService {
//   constructor(private prisma: PrismaService) {}

//   async create(joinedRoom: Room): Promise<Room> {
//     return this.prisma.joinedRoom.create({
//       data: {
//         socketId: joinedRoom.socketId,
//         room: joinedRoom.room,
//         user: joinedRoom.user,
//         roomId: joinedRoom.roomId,
//         userId: joinedRoom.userId,
//       },
//     });
//   }

//   async findByUser(user: User): Promise<JoinedRoom[]> {
//     return this.prisma.joinedRoom.find({ user });
//   }

//   async findByRoom(room: Room): Promise<JoinedRoom[]> {
//     return this.prisma.joinedRoom.find({ room });
//   }

//   async deleteBySocketId(socketId: string) {
//     return this.prisma.joinedRoom.delete({ socketId });
//   }

//   async deleteAll() {
//     await this.prisma.joinedRoom.delete();
//   }
// }
