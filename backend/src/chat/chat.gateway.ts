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
import { Logger } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { ChatService } from "./chat.service";
import { RoomService } from "src/room/room.service";
import { User, Room } from "@prisma/client";
// import { WsGuard } from "src/common/guards/ws.guard";

@WebSocketGateway(8082)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger("ChatGateway");
  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private roomService: RoomService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(@MessageBody() client: Socket) {
    this.server.in(client.id).socketsJoin("general");
    this.logger.debug(`user with socket ${client.id} connected`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log("handleDisconnect clientid: ", client.id);
  }

  @SubscribeMessage("disconnecting")
  handleDisconnecting(@ConnectedSocket() client: Socket) {
    console.log('chat room: ', client.rooms);
    client.rooms.forEach((room) => {
      this.logger.log(`disconnecting user ${client.id} from room ${room}`);
    });
  }

  // @UseGuards(WsGuard)
  @SubscribeMessage("cliMessage")
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage");
    this.logger.debug("body: ", body, "ConnectedSocket: ", client.id);
    const user = await this.userService.findById(body.user.id);
    if (!user) throw new Error("onMessage no user found");
    if (user.chatSocket != client.id)
      this.userService.updateChatSocket(user.id, client.id);
    const room = await this.roomService.findById(body.room.id);
    if (!room) throw new Error("onMessage no room found");
    // client.join(body.room.name);
    // this.server.in(user.chatSocket).socketsJoin(body.room.name);
    this.chatService.createMessage(body);
    this.server.to(body.room.name).emit("servMessage", body);
  }

  // @UseGuards(WsGuard)
  @SubscribeMessage("join_room")
  async onJoinRoom(
    @MessageBody()
    payload: {
      user: User;
      room: Room;
    },
  ): Promise<void> {
    this.logger.log(`${payload.user.username} is joining ${payload.room.name}`);
    const user = await this.userService.findById(payload.user.id);
    if (!user) throw new Error("onJoinRoom no user found");
    const room = await this.roomService.findById(payload.room.id);
    if (!room) throw new Error("onJoinRoom no room found");
    this.server.in(user.chatSocket).socketsJoin(room.name);
    if (room.private) this.server.emit("updatePrivate");
    else this.server.emit("update");
  }

  // @UseGuards(WsGuard)
  @SubscribeMessage("leave_room")
  async onLeaveRoom(
    @MessageBody()
    payload: {
      user: User;
      room: Room;
    },
  ): Promise<void> {
    this.logger.log(`${payload.user.username} is leaving ${payload.room.name}`);
    const user = await this.userService.findById(payload.user.id);
    if (!user) throw new Error("onLeaveRoom no user found");
    const room = await this.roomService.findById(payload.room.id);
    if (!room) throw new Error("onLeaveRoom no room found");
    this.server.in(user.chatSocket).socketsLeave(room.name);
    this.server.emit("update");
  }
}
