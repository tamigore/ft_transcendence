import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
  BadRequestException,
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { ChatService } from "./chat.service";
import { RoomService } from "src/room/room.service";
import { User } from "@prisma/client";
import { WsGuard } from "src/common/guards";
import { SendMessageDto } from "./dto";
import type { RoomWithAll } from "src/room/dto/types";

type AuthenticatedSocket = Socket & {
  data: {
    user?: User;
  };
};

type RoomEventPayload = {
  roomId?: number;
  room?: {
    id?: number;
  };
};

@WebSocketGateway(8082)
@UseGuards(WsGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger("ChatGateway");
  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private roomService: RoomService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: AuthenticatedSocket) {
    const user = this.getSocketUser(client);
    await this.userService.updateChatSocket(user.id, client.id);
    await client.join("general");
    this.logger.debug(`user ${user.username} connected with socket ${client.id}`);
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`handleDisconnect clientId: ${client.id}`);
  }

  @SubscribeMessage("disconnecting")
  handleDisconnecting(@ConnectedSocket() client: Socket) {
    console.log("chat room: ", client.rooms);
    client.rooms.forEach((room) => {
      this.logger.log(`disconnecting user ${client.id} from room ${room}`);
    });
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SubscribeMessage("cliMessage")
  async onMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: SendMessageDto,
  ) {
    this.logger.log("onMessage");
    const user = this.getSocketUser(client);
    const sanitizedText = body.text.trim();
    if (!sanitizedText.length) {
      this.logger.warn(`User ${user.id} tried to send an empty message to room ${body.roomId}`);
      return null;
    }

    const room = await this.roomService.findByIdWithAll(body.roomId);
    if (!room || !this.canUserSpeak(room, user.id)) return null;

    const message = await this.chatService.createMessage({
      text: sanitizedText,
      roomId: room.id,
      userId: user.id,
    });

    const outbound = {
      id: message.id,
      text: message.text,
      created_at: message.created_at,
      room: { id: room.id, name: room.name, private: room.private },
      roomId: room.id,
      user: {
        id: user.id,
        username: user.username,
        img: user.img,
      },
      userId: user.id,
    };

    this.server.to(room.name).emit("servMessage", outbound);
    return outbound;
  }

  @SubscribeMessage("join_room")
  async onJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RoomEventPayload,
  ): Promise<void> {
    const user = this.getSocketUser(client);
    const roomId = this.getRoomIdFromPayload(payload);
    if (!roomId) return;
    const room = await this.roomService.findByIdWithAll(roomId);
    if (!room || !this.isRoomMember(room, user.id)) return;

    await client.join(room.name);
    if (room.private) this.server.emit("updatePrivate");
    else this.server.emit("update");
  }

  @SubscribeMessage("leave_room")
  async onLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RoomEventPayload,
  ): Promise<void> {
    const roomId = this.getRoomIdFromPayload(payload);
    if (!roomId) return;
    const room = await this.roomService.findById(roomId);
    if (!room) return;
    await client.leave(room.name);
    this.server.emit("update");
  }

  @SubscribeMessage("update")
  async update(@MessageBody() payload: RoomEventPayload): Promise<void> {
    const roomId = this.getRoomIdFromPayload(payload);
    if (!roomId) return;
    const room = await this.roomService.findById(roomId);
    if (!room) return;
    this.server.to(room.name).emit("update");
  }

  @SubscribeMessage("inviteGame")
  async inviteGame(
    @MessageBody()
    payload: {
      user1: User;
      user2: User;
    },
  ): Promise<void> {
    this.server.to(payload.user2.chatSocket).emit("inviteGame", payload);
  }

  private getSocketUser(client: AuthenticatedSocket): User {
    const user = client.data?.user;
    if (!user) throw new BadRequestException("Socket missing authenticated user context");
    return user;
  }

  private canUserSpeak(room: RoomWithAll, userId: number): boolean {
    if (!this.isRoomMember(room, userId)) return false;
    if (this.roomService.isBan(room, userId)) return false;
    if (this.roomService.isMute(room, userId)) return false;
    return true;
  }

  private isRoomMember(room: RoomWithAll, userId: number): boolean {
    return (
      this.roomService.isOwner(room, userId) ||
      this.roomService.isAdmin(room, userId) ||
      this.roomService.isUser(room, userId)
    );
  }

  private getRoomIdFromPayload(payload: RoomEventPayload): number | null {
    if (!payload) return null;
    if (typeof payload.roomId === "number") return payload.roomId;
    if (typeof payload.room?.id === "number") return payload.room.id;
    return null;
  }
}
