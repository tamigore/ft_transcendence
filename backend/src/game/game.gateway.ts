import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { User, Game } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { GameService } from "./game.service";
import {
  GameMove,
  BallState,
  PaddleState,
  BlockState,
} from "./game.interfaces";

@WebSocketGateway(8081)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger("GameGateway");
  constructor(private gameService: GameService) {}

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
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { moove: GameMove; room: string },
  ) {
    this.logger.log("gameMessage");
    // this.logger.debug("MEaasfe body: ", body, "ConnectedSocket: ", client.id);
    this.server.to(body.room).emit("servMessage", body.moove);
  }

  @SubscribeMessage("paddlePosMessage")
  async onPaddlePos(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { state: PaddleState; room: string },
  ) {
    this.logger.log("paddlePosMessage");
    // this.logger.debug("ICI PADDLE: ", body, "ConnectedSocket: ", client.id);
    // const str = body.room;
    // this.logger.debug("teast ROOM ", str);
    this.server.to(body.room).emit("paddleStateMessage", body.state);
  }

  @SubscribeMessage("pingMessage")
  async onPong(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { ballInfo: BallState; room: string },
  ) {
    this.logger.log("pingMessage");
    // this.logger.debug("HitMEssage bodyy: ", body, "ConnectedSocket: ", client.id);
    this.server.to(body.room).emit("pongMessage", body.ballInfo);
  }

  @SubscribeMessage("joinGameRoom")
  async onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() e: { user: User; room: string },
  ): Promise<boolean> {
    this.logger.log("---joinGameRoom------", client.id, e.room);
    this.server.in(client.id).socketsJoin(e.room);
    this.server.to(e.room).emit("", e);
    return true;
  }

  @SubscribeMessage("ReadyGame")
  async onlaunchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; ball: BallState },
  ) {
    this.logger.log("LauchGame");
    this.server.to(body.room).emit("LaunchGame", body.ball);
  }

  @SubscribeMessage("ballSetter")
  async onBallSetter(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { ballInfo: BallState; room: string },
  ) {
    // console.log("ballSetter  : ", body.ballInfo);
    this.logger.log("setBall");
    this.server.to(body.room).emit("setBall", body.ballInfo);
  }

  @SubscribeMessage("goalMessage")
  async onGoalMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; player: number },
  ) {
    // console.log("goalMessage from player  : ", body.player);
    this.logger.log("goalMessage");
    this.server.to(body.room).emit("scoreMessage", body.player);
  }

  @SubscribeMessage("createBlock")
  async onBlockCreatation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; block: BlockState },
  ) {
    // console.log("block creation ^^  : ", body.block.id);
    this.server.to(body.room).emit("blockCreation", body.block);
  }

  @SubscribeMessage("destroyBlock")
  async onBlockdestruction(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; blockId: number },
  ) {
    // console.log("block DESTRUCTION ^^  : ", body.blockId);
    this.server.to(body.room).emit("blockDestruction", body.blockId);
  }

  @SubscribeMessage("createBall")
  async onBallCreatation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; ball: BallState },
  ) {
    console.log("ball creation ^^  : ", body.ball.ballId);
    this.server.to(body.room).emit("ballCreation", body.ball);
  }

  @SubscribeMessage("destroyBall")
  async onBallDestruction(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; ballId: number },
  ) {
    console.log("ball DESTRUCTION ^^  : ", body.ballId);
    this.server.to(body.room).emit("ballDestruction", body.ballId);
  }

  @SubscribeMessage("endGame")
  async onEndGame(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: {
      room: string;
      game: Game;
      winner: number;
      looser: number;
      score: string;
    },
  ) {
    console.log("---------------EndGame ^^ winner : ", body.winner);
    this.server.to(body.room).emit("gameEnder");
    this.gameService.gameToHistoric(
      body.game,
      body.winner,
      body.looser,
      body.score,
    );
  }
}
