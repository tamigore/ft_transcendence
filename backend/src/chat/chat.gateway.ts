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
import { Logger, UseGuards } from "@nestjs/common";
import { AtGuard } from "src/common/guards";
import { UserService } from "src/user/user.service";
import { ChatService } from "./chat.service";
// import { JoinRoom } from "./chat.interface";

@WebSocketGateway(8082)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger("ChatGateway");
  constructor(
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  // @UseGuards(AtGuard)
  async handleConnection(@MessageBody() client: Socket, ...args: any[]) {
    this.logger.log("ChatGateway handleConnection args: ", args);
    this.logger.log(`user with socket ${client.id} connected`);
    client.join(client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log("ChatGateway handleDisconnect clientid: ", client.id);
    client.disconnect();
  }

  @SubscribeMessage("cliMessage")
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage");
    this.logger.debug("body: ", body);
    this.logger.debug("ConnectedSocket: ", client);
    this.chatService.createMessage(body.message);
    this.server.emit("servMessage", {
      username: "Username",
      text: body.text,
      object: body.object,
      channel: "room",
    });
  }

  // @UseGuards(WsThrottlerGuard)
  // @UsePipes(new ZodValidationPipe(JoinRoomSchema))
  // @SubscribeMessage("join_room")
  // async handleSetClientDataEvent(
  //   @MessageBody()
  //   payload: JoinRoom,
  // ): Promise<boolean> {
  //   this.logger.log(
  //     `${payload.user.chatSocket} is joining ${payload.roomName}`,
  //   );
  //   const user = this.userService.findById(payload.user.id, payload.user.id);
  //   user.chatSocket = payload.user.chatSocket;
  //   await this.userService.update(payload.user.id, payload.user.id, user);
  //   this.server.in(payload.user.socketId).socketsJoin(payload.roomName);
  //   await this.roomService.addUserToRoom(payload.roomName, payload.user.userId);
  //   return true;
  // }
}
