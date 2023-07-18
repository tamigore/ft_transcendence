import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
// import { Message } from "@prisma/client";
// import { ChatService } from "./chats.service";
import { Logger, UseGuards } from "@nestjs/common";
import { AtGuard } from "src/common/guards";
import { UserService } from "src/user/user.service";
// import { WsGuard } from "src/common/guards/ws.guard";

// import {
//   getUserDeviceRoom,
//   stopTimerForUserDevice,
//   startTimerForUserDevice,
// } from "./socket/room";
// import { TimerEvents } from "./socket/events";

@WebSocketGateway(8082)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger("ChatGateway");
  constructor(
    // private chatService: ChatService,
    private userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log("ChatGateway afterInit");
  }

  @UseGuards(AtGuard)
  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log("ChatGateway handleConnection args: ", args);
    this.logger.log(`user with socket ${client.id} connected`);
    // const user = await this.userService.findByID(args.pop());
    // if (!user) {
    //   client.disconnect();
    // } else {
    client.join(client.id);
    // }
  }

  handleDisconnect(client: Socket) {
    this.logger.log("ChatGateway handleDisconnect clientid: ", client.id);
    client.disconnect();
  }

  // @SubscribeMessage(TimerEvents.timerStart.toString())
  // startMyTimer(@ConnectedSocket() client: any, @MessageBody() body: any): void {
  //   // Stop any existing timer for this user device.
  //   stopTimerForUserDevice(
  //     client.user.id,
  //     client.handshake.query.deviceId.toString()
  //   );

  //   // Start a new timer for this user device.
  //   startTimerForUserDevice(
  //     this.server,
  //     client.user.id,
  //     client.handshake.query.deviceId.toString(),
  //     body.dur // Timer duration
  //   );
  // }

  // @SubscribeMessage(TimerEvents.timerStop.toString())
  // stopMyTimer(@ConnectedSocket() client: any): void {
  //   // Stop current timer for this user device.
  //   stopTimerForUserDevice(
  //     client.user.id,
  //     client.handshake.query.deviceId.toString()
  //   );
  // }

  @SubscribeMessage("cliMessage")
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage in chat gateway: body = ", body);
    this.logger.log("Socket ID: ", client.id);
    this.logger.log("User hash: ", client.handshake.auth.token);
    // this.chatService.createMessage(body);
    if (body.channel === "general") {
      this.server.emit("servMessage", {
        username: body.username,
        text: body.text,
        object: body.object,
        channel: body.channel,
      });
    } else {
      // if (user.rooms.indexOf(body.channel)) {
      //   this.logger.log("Room was find");
      // } else {
      //   this.logger.log("Room wasn't find");
      // }
      this.server.to(body.channel).emit("servMessage", {
        username: body.username,
        text: body.text,
        object: body.object,
        channel: body.channel,
      });
    }
  }

  // @UseGuards(WsThrottlerGuard)
  // @UsePipes(new ZodValidationPipe(JoinRoomSchema))
  @SubscribeMessage("join_room")
  async handleSetClientDataEvent(
    @MessageBody()
    payload: JoinRoom,
  ): Promise<boolean> {
    this.logger.log(`${payload.user.socketId} is joining ${payload.roomName}`);
    const user = this.userService.findById(
      payload.user.userId,
      payload.user.userId,
    );
    user.socketId = payload.user.socketId;
    await this.userService.update(
      payload.user.userId,
      payload.user.userId,
      user,
    );
    this.server.in(payload.user.socketId).socketsJoin(payload.roomName);
    await this.roomService.addUserToRoom(payload.roomName, payload.user.userId);
    return true;
  }
}
