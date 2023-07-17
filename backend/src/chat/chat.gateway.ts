import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger, UseGuards, UsePipes } from "@nestjs/common";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Message,
  JoinRoom,
  KickUser,
} from "../shared/interfaces/chat.interface";
import { Server, Socket } from "socket.io";
import { RoomService } from "../room/room.service";
import { ZodValidationPipe } from "../pipes/zod.pipe";
import {
  ChatMessageSchema,
  JoinRoomSchema,
  KickUserSchema,
} from "../shared/schemas/chat.schema";
import { UserService } from "../user/user.service";
import { WsThrottlerGuard } from "./guards/throttler.guard";
import { Throttle } from "@nestjs/throttler";

@WebSocketGateway({})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private roomService: RoomService,
    private userService: UserService,
  ) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private logger = new Logger("ChatGateway");

  @Throttle(10, 30)
  @UseGuards(WsThrottlerGuard)
  @UsePipes(new ZodValidationPipe(ChatMessageSchema))
  @SubscribeMessage("chat")
  async handleChatEvent(
    @MessageBody()
    payload: Message,
  ): Promise<boolean> {
    this.logger.log(payload);
    this.server.to(payload.roomName).emit("chat", payload);
    return true;
  }

  @UseGuards(WsThrottlerGuard)
  @UsePipes(new ZodValidationPipe(JoinRoomSchema))
  @SubscribeMessage("join_room")
  async handleSetClientDataEvent(
    @MessageBody()
    payload: JoinRoom,
  ): Promise<boolean> {
    this.logger.log(`${payload.user.socketId} is joining ${payload.roomName}`);
    const user = {
      userId: payload.user.userId,
      userName: payload.user.userName,
      socketId: payload.user.socketId,
    };
    await this.userService.addUser(user);
    this.server.in(payload.user.socketId).socketsJoin(payload.roomName);
    await this.roomService.addUserToRoom(payload.roomName, payload.user.userId);
    return true;
  }

  // @UseGuards(WsThrottlerGuard)
  @UsePipes(new ZodValidationPipe(KickUserSchema))
  @SubscribeMessage("kick_user")
  async handleKickUserEvent(
    @MessageBody() payload: KickUser,
  ): Promise<boolean> {
    this.logger.log(
      `${payload.userToKick.userName} is getting kicked from ${payload.roomName}`,
    );
    this.server.to(payload.roomName).emit("kick_user", payload);
    this.server.in(payload.userToKick.socketId).socketsLeave(payload.roomName);
    this.server.to(payload.roomName).emit("chat", {
      user: {
        userId: "serverId",
        userName: "TheServer",
        socketId: "ServerSocketId",
      },
      timeSent: new Date(Date.now()).toLocaleString("en-US"),
      message: `${payload.userToKick.userName} was kicked.`,
      roomName: payload.roomName,
    });
    return true;
  }

  // @UseGuards(WsThrottlerGuard)
  async handleConnection(socket: Socket): Promise<void> {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  // @UseGuards(WsThrottlerGuard)
  async handleDisconnect(socket: Socket): Promise<void> {
    const user = await this.roomService.getFirstInstanceOfUser(socket.id);
    if (user !== "Not Exists") {
      await this.userService.removeUserById(user.userId);
    }
    await this.roomService.removeUserFromAllRooms(socket.id);
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
