import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { GameService } from "./game.service";
import { RoomService } from "src/room/room.service";
import {GameMove, BallState, PaddleState} from "./game.interfaces";
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
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: { moove: GameMove, room: string}) {
    this.logger.log("gameMessage");
    this.logger.debug("ICI body: ", body, "ConnectedSocket: ", client.id);
    this.server.to(body.room).emit("servMessage", body.moove);
  }

  @SubscribeMessage("paddlePosMessage")
  async onPaddlePos(@ConnectedSocket() client: Socket, @MessageBody() body: { state: PaddleState, room: string}) {
    this.logger.log("paddlePosMessage");
    this.logger.debug("ICI bodyyyy: ", body, "ConnectedSocket: ", client.id);
    const str = body.room;
    this.logger.debug("teast ROOM ", str);

    this.server.to(body.room).emit("paddleStateMessage", body.state);
  }

  @SubscribeMessage("pingMessage")
  async onPong(@ConnectedSocket() client: Socket, @MessageBody() body: {ballInfo: BallState, room: string}) {
    this.logger.log("pingMessage");
    this.logger.debug("HitMEssage bodyy: ", body, "ConnectedSocket: ", client.id);
    this.server.to(body.room).emit("pongMessage", body.ballInfo);
  }

  @SubscribeMessage("joinGameRoom")
  async onJoinRoom(
    @MessageBody() e: { user: User; room: string },
  ): Promise<boolean> {
    this.logger.log("---joinGameRoom------");
    this.server.in(e.user.gameSocket).socketsJoin(e.room);
    this.server.to(e.room).emit("gameRoomJoiner", e);
    return true;
  }
}

