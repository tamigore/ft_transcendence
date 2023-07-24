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
import { JoinRoom } from "./chat.interface";
import { RoomService } from "src/room/room.service";
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
    this.logger.debug(`user with socket ${client.id} connected`);
    return client.id;
  }

  async handleDisconnect(client: Socket) {
    this.logger.log("ChatGateway handleDisconnect clientid: ", client.id);
  }

  // @UseGuards(WsGuard)
  @SubscribeMessage("cliMessage")
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage");
    this.logger.debug("body: ", body, "ConnectedSocket: ", client.id);
    this.chatService.createMessage(body.message, body.room.id, body.user.id);
    this.server.to(body.room.name).emit("servMessage", {
      user: body.user,
      message: body.message,
      room: body.room,
    });
  }

  // @UseGuards(WsThrottlerGuard)
  // @UsePipes(new ZodValidationPipe(JoinRoomSchema))
  // @UseGuards(WsGuard)
  @SubscribeMessage("join_room")
  async onJoinRoom(
    @MessageBody()
    payload: JoinRoom,
  ): Promise<boolean> {
    this.logger.log(`${payload.user.username} is joining ${payload.room.name}`);
    const user = await this.userService.findById(payload.user.id);
    if (!user) throw new Error("onJoinRoom no user found");
    let room = await this.roomService.findById(payload.room.id);
    if (!room) room = await this.roomService.createRoom(payload.room);
    this.server.in(user.chatSocket).socketsJoin(room.name);
    await this.roomService.addUser(room.id, user.id);
    return true;
  }
}
