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
import { GameService } from "./game.service";
import { JoinGameRoom } from "./game.interfaces";
import { RoomService } from "src/room/room.service";
// import { WsGuard } from "src/common/guards/ws.guard";

@WebSocketGateway(8081)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger("GameGateway");
  constructor(
    private gameService: GameService,
    private userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  // @UseGuards(WsGuard)
  async handleConnection(@MessageBody() client: Socket) {
    this.logger.log("GameGateway handleConnection clientid: ", client.id);

  }

  // @UseGuards(WsGuard)
  async handleDisconnect(client: Socket) {
    this.logger.log("GameGateway handleDisconnect clientid: ", client.id);

  }

  // @UseGuards(WsGuard)
  @SubscribeMessage("gameMessage")
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage");
    this.logger.debug("ICI body: ", body, "ConnectedSocket: ", client.id);
    this.server.emit("servMessage", body);
  }

  @SubscribeMessage("paddlePosMessage")
  async onPaddlePos(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage");
    this.logger.debug("ICI body: ", body, "ConnectedSocket: ", client.id);
    this.server.emit("paddleStateMessage", body);
  }

  @SubscribeMessage("pingMessage")
  async onPong(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage");
    this.logger.debug("HitMEssage body: ", body, "ConnectedSocket: ", client.id);
    this.server.emit("pongMessage", body);
  }

  @SubscribeMessage("join_room")
  async onJoinRoom(
    @MessageBody()
    payload: JoinGameRoom,
  ): Promise<boolean> {
    // this.logger.log(`${payload.user.username} is joining ${payload.room.name}`);
    // const user = await this.userService.findById(payload.user.id);
    // if (!user) throw new Error("onJoinRoom no user found");
    // let room = await this.roomService.findById(payload.room.id);
    // if (!room) room = await this.roomService.createRoom(payload.room);
    this.server.in(payload.user.chatSocket).socketsJoin(payload.room.name);
    // await this.roomService.addUser(room.id, user.id);
    return true;
  }
}

