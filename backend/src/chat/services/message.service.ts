// import { Injectable } from "@nestjs/common";
// import { Room, Message } from "@prisma/client";
// import { PrismaService } from "src/prisma/prisma.service";

// @Injectable()
// export class MessageService {
//   constructor(private prisma: PrismaService) {}

//   async create(message: Message): Promise<Message> {
//     return this.prisma.message.create({
//       data: {
//         username: message.username,
//         object: message.object,
//         text: message.text,
//         channel: message.channel,
//         room: message.room,
//         user: message.user,
//         roomId: message.roomId,
//         userId: message.userId,
//       },
//     });
//   }

//   async findMessagesForRoom(room: Room): Promise<Message[]> {
//     return this.prisma.message.findMany({
//       where: {
//         room: room,
//       },
//     });
//   }
// }
