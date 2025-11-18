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
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
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
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: AuthenticatedSocket) {
    const user = await this.getSocketUser(client);
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
    const user = await this.getSocketUser(client);
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
    const user = await this.getSocketUser(client);
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

  private async getSocketUser(client: AuthenticatedSocket): Promise<User> {
    if (client.data?.user) return client.data.user;
    const token = this.extractToken(client);
    if (!token)
      throw new BadRequestException("Socket missing authenticated user context");
    const payload = await this.jwtService.verifyAsync<{ sub: number }>(token, {
      secret: this.config.get<string>("AT_SECRET"),
    });
    if (!payload?.sub)
      throw new BadRequestException("Socket JWT payload missing subject");
    const user = await this.userService.findById(payload.sub);
    if (!user)
      throw new BadRequestException("Socket user could not be resolved from token");
    client.data = client.data ?? {};
    client.data.user = user;
    return user;
  }

  private extractToken(client: Socket): string | null {
    const candidates = [
      client.handshake.auth?.token,
      client.handshake.headers?.authorization,
      this.normalizeQueryToken(client.handshake.query?.token),
    ];

    for (const raw of candidates) {
      const normalized = this.normalizeToken(raw);
      if (normalized) return normalized;
    }
    return null;
  }

  private normalizeToken(raw?: string | string[]): string | null {
    if (!raw) return null;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.toLowerCase().startsWith("bearer ")) {
      return trimmed.slice(7).trim();
    }
    return trimmed;
  }

  private normalizeQueryToken(token?: string | string[]): string | undefined {
    if (!token) return undefined;
    return Array.isArray(token) ? token[0] : token;
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
