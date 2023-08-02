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
import { GameMove } from "./game.interfaces";
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

  @SubscribeMessage("pingMessage")
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage");
    this.logger.debug("HitMEssage body: ", body, "ConnectedSocket: ", client.id);
    this.server.emit("pongMessage", body);
  }
}
