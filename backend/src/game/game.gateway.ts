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
    console.log("in handle client.rooms : ", client.rooms);
    this.logger.log("GameGateway handleDisconnect clientid: ", client.id);
  }

  @SubscribeMessage("disconnecting")
  handleDisconnecting(@ConnectedSocket() client: Socket) {
    console.log("==================Game disconnecting client", client.id);
    console.log("client.rooms : ", client.rooms);
    client.rooms.forEach((room) => {
      this.logger.log(
        `=========================Game disconnecting user ${client.id} from room ${room}`,
      );
    });
  }

  // @UseGuards(WsGuard)
  @SubscribeMessage("gameMessage")
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { moove: GameMove; room: string },
  ) {
    this.logger.log("gameMessage");
    this.server.to(body.room).emit("servMessage", body.moove);
  }

  @SubscribeMessage("paddlePosMessage")
  async onPaddlePos(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { state: PaddleState; room: string },
  ) {
    this.logger.log("paddlePosMessage");
    this.server.to(body.room).emit("paddleStateMessage", body.state);
  }

  @SubscribeMessage("pingMessage")
  async onPong(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { ballInfo: BallState; room: string },
  ) {
    this.logger.log("pingMessage");
    this.server.to(body.room).emit("pongMessage", body.ballInfo);
  }

  @SubscribeMessage("joinGameRoom")
  async onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() e: { user: User; room: string },
  ) {
    this.logger.log("---joinGameRoom------", e.user.username, e.room);
    // client.join(e.room);
    this.server.in(client.id).socketsJoin(e.room);
    console.log("====== in join client.rooms : ", e.user.username, client.rooms);
    this.server.to(e.room).emit("gameRoomJoiner", e);
		console.log("gameRoomJoinerSent");
    // return true;
  }

  @SubscribeMessage("leaveGameRoom")
  async onLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      room: string;
    },
  ): Promise<void> {
    console.log("============leaveGameRoom");
    this.server.in(client.id).socketsLeave(payload.room);
  }

  @SubscribeMessage("ReadyGame")
  async onlaunchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; ball: BallState },
  ) {
		
    client.rooms.forEach((room) => {
      if (room === body.room) {
        return false;
      }
    });
		console.log("in onReadyGame");
    this.logger.log("LauchGame");
    this.server.to(body.room).emit("LaunchGame", body.ball);
  }

  @SubscribeMessage("ballSetter")
  async onBallSetter(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { ballInfo: BallState; room: string },
  ) {
    this.logger.log("setBall");
    this.server.to(body.room).emit("setBall", body.ballInfo);
  }

  @SubscribeMessage("goalMessage")
  async onGoalMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; player: number },
  ) {
    this.logger.log("goalMessage");
    this.server.to(body.room).emit("scoreMessage", body.player);
  }

  @SubscribeMessage("createBlock")
  async onBlockCreatation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; block: BlockState },
  ) {
    this.server.to(body.room).emit("blockCreation", body.block);
  }

  @SubscribeMessage("destroyBlock")
  async onBlockdestruction(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; blockId: number },
  ) {
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

  @SubscribeMessage("newSpectator")
  async newSpectator(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; user: User },
  ) {
    console.log("new spectator : ", body.user.username);
    this.server.to(body.room).emit("servNewSpectator", body.user);
  }

  @SubscribeMessage("onSpecBlock")
  async onSpecBlock(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; block: BlockState; userId: number },
  ) {
    console.log("spectator block id : ", body.block.id);
    this.server
      .to(body.room)
      .emit("servOnSpecBlock", { block: body.block, userId: body.userId });
  }

  @SubscribeMessage("onSpecBall")
  async onSpecBall(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; ball: BallState; userId: number },
  ) {
    console.log("spectator ball id", body.ball.ballId);
    this.server
      .to(body.room)
      .emit("servOnSpecBall", { ball: body.ball, userId: body.userId });
  }

  @SubscribeMessage("onSpecPaddle")
  async onSpecPaddle(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; paddle: PaddleState; userId: number },
  ) {
    console.log("spectator paddle : ", body.paddle);
    this.server
      .to(body.room)
      .emit("servOnSpecPaddle", { paddle: body.paddle, userId: body.userId });
  }

  @SubscribeMessage("onSpecScore")
  async onSpecScore(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { room: string; scoreA: number; scoreB: number; userId: number },
  ) {
    console.log("spectator score");
    this.server.to(body.room).emit("servOnSpecScore", {
      scoreA: body.scoreA,
      scoreb: body.scoreB,
      userId: body.userId,
    });
  }

  @SubscribeMessage("queueLeave")
  async onQueueLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameId: number },
  ) {
    console.log("queueLeave");
    this.gameService.queueLeave(body.gameId);
  }

	


	@SubscribeMessage("inviteJoinGameRoom")
  async oninvitejoinRoom(
		@ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string },
	) {
		console.log("inviteGame");
		this.server.in(client.id).socketsJoin(body.room);
	}


	@SubscribeMessage("inviteGame")
  async onInviteGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { user1username: string, user2username: string },
  ) {
    const game = await this.gameService.inviteGame(body);
		console.log("inviteGame : ", game);
		if (!game)
			return ;
		this.server.to(body.user1username).emit("servInviteGame",{ game});

  }
	@SubscribeMessage("refusInvite")
  async onRefusInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameRoom: string },
  ) {
		
		this.server.to(body.gameRoom).emit("c",{ });
  }
}
