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
import { Logger, UseGuards } from "@nestjs/common";
import { GameService } from "./game.service";
import {
  GameMove,
  BallState,
  PaddleState,
  BlockState,
} from "./game.interfaces";
import { WsGuard } from "src/common/guards";

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 700;
const SERVER_TICK_MS = 1000 / 120;
const PADDLE_SPEED = 7; // matches 14 / setVeloDiv from frontend settings
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;
const BALL_START_SPEED_X = 3;
const BALL_START_SPEED_Y = 3;
const BALL_MAX_SPEED_X = 22;
const BALL_MAX_SPEED_Y = 16.5;
const PADDLE_OFFSET = 20;
const PADDLE_WIDTH = 10;
const WINNING_SCORE = 5;

type PlayerIndex = 1 | 2;

interface InputState {
  up: boolean;
  down: boolean;
}

interface RuntimeBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: number;
}

interface RuntimePaddle extends PaddleState {
  speed: number;
}

interface RoomState {
  room: string;
  game?: Game & { player1: User; player2: User | null };
  ball: RuntimeBall;
  paddles: Record<PlayerIndex, RuntimePaddle>;
  inputs: Record<PlayerIndex, InputState>;
  scores: Record<PlayerIndex, number>;
  interval?: ReturnType<typeof setInterval>;
  running: boolean;
  lastTick: number;
  finishing?: boolean;
}

@WebSocketGateway(8081)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger("GameGateway");
  private roomStates = new Map<string, RoomState>();
  private socketRoles = new Map<string, { room: string; player?: PlayerIndex; userId?: number }>();

  constructor(private gameService: GameService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    this.logger.log("GameGateway handleConnection clientid: ", client.id);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log("GameGateway handleDisconnect clientid: ", client.id);
    await this.handleClientDeparture(client, true);
  }

  @SubscribeMessage("disconnecting")
  handleDisconnecting(@ConnectedSocket() client: Socket) {
    console.log("client.rooms : ", client.rooms);
    client.rooms.forEach((room) => {
      this.logger.log(
        `=========================Game disconnecting user ${client.id} from room ${room}`,
      );
    });
  }

  @SubscribeMessage("gameMessage")
  @UseGuards(WsGuard)
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { moove: GameMove; room: string },
  ) {
    const socketMeta = this.socketRoles.get(client.id);
    if (!socketMeta) {
      this.logger.warn("Ignoring input from unregistered socket", client.id);
      return;
    }
    const state = this.roomStates.get(socketMeta.room);
    if (!state) {
      this.logger.warn("No runtime state for room", socketMeta.room);
      return;
    }
    const player = await this.resolveSocketPlayer(
      client,
      socketMeta,
      state,
      body.moove.player as PlayerIndex,
    );
    if (!player) {
      this.logger.warn("Player role unresolved for socket", client.id);
      return;
    }
    this.applyInput(state, player, body.moove);
  }

  @SubscribeMessage("paddlePosMessage")
  async onPaddlePos(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { state: PaddleState; room: string },
  ) {
    this.logger.log("paddlePosMessage ignored: server authoritative");
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
    this.server.in(client.id).socketsJoin(e.room);
    const role = await this.resolvePlayerIndex(e.room, e.user.id);
    this.registerSocketRole(client, e.room, role, e.user.id);
    console.log(
      "====== in join client.rooms : ",
      e.user.username,
      client.rooms,
    );
    this.server.to(e.room).emit("gameRoomJoiner", e);
    console.log("gameRoomJoinerSent");
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
    await this.handleClientDeparture(client, false);
  }

  @SubscribeMessage("ReadyGame")
  async onlaunchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; ball?: BallState; gameId?: number },
  ) {
    const state = await this.prepareRoomState(body.room);
    if (!state.game) {
      state.game = await this.gameService.findGameByRoom(body.room);
    }
    this.logger.log(`ReadyGame received for room ${body.room}`);
    this.startRoomLoop(state);
    this.server.to(body.room).emit("LaunchGame", this.serializeBall(state));
  }

  @SubscribeMessage("ballSetter")
  async onBallSetter(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { ballInfo: BallState; room: string },
  ) {
    this.logger.log("ballSetter ignored: server authoritative");
  }

  @SubscribeMessage("goalMessage")
  async onGoalMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string; player: number },
  ) {
    this.logger.log("goalMessage ignored: server authoritative");
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
    await this.teardownRoom(body.room);
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
    const state = this.roomStates.get(body.room);
    if (state) {
      this.server.to(body.room).emit("servOnSpecBall", {
        ball: this.serializeBall(state),
        userId: body.user.id,
      });
      Object.values(state.paddles).forEach((paddle) => {
        this.server.to(body.room).emit("servOnSpecPaddle", {
          paddle: this.serializePaddle(paddle),
          userId: body.user.id,
        });
      });
      this.server.to(body.room).emit("servOnSpecScore", {
        scoreA: state.scores[1],
        scoreB: state.scores[2],
        userId: body.user.id,
      });
    }
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
      scoreB: body.scoreB,
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
    @MessageBody() body: { user1username: string; user2username: string },
  ) {
    const game = await this.gameService.inviteGame(body);
    console.log("inviteGame : ", game);
    if (!game) {
      console.log("========game not created");
      return;
    }
    this.server.to(body.user1username).emit("servInviteGame", { game });
  }
  @SubscribeMessage("refusInvite")
  async onRefusInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { gameRoom: string },
  ) {
    this.server.to(body.gameRoom).emit("c", {});
  }

  private async handleClientDeparture(client: Socket, isDisconnect: boolean) {
    const meta = this.socketRoles.get(client.id);
    if (!meta) return;
    this.socketRoles.delete(client.id);
    if (!meta.player) return;
    const state = this.roomStates.get(meta.room);
    if (!state) return;
    this.logger.warn(
      `Player ${meta.player} ${isDisconnect ? "disconnected" : "left"} room ${meta.room}`,
    );
    if (!state.running) {
      this.roomStates.delete(meta.room);
      return;
    }
    await this.finishMatch(state, meta.player === 1 ? 2 : 1);
  }

  private registerSocketRole(
    client: Socket,
    room: string,
    player?: PlayerIndex,
    userId?: number,
  ) {
    this.socketRoles.set(client.id, { room, player, userId });
    this.getOrCreateRoomState(room);
  }

  private async resolvePlayerIndex(room: string, userId: number) {
    const state = this.getOrCreateRoomState(room);
    await this.ensureGameState(state, !state.game);
    if (!this.isKnownPlayer(state, userId)) {
      await this.ensureGameState(state, true);
    }
    if (state.game?.player1Id === userId) return 1;
    if (state.game?.player2Id === userId) return 2;
    return undefined;
  }

  private async resolveSocketPlayer(
    client: Socket,
    meta: { room: string; player?: PlayerIndex; userId?: number },
    state: RoomState,
    requested?: PlayerIndex,
  ): Promise<PlayerIndex | undefined> {
    if (meta.player) return meta.player;

    const authUserId: number | undefined = client.data?.user?.id;
    if (authUserId && meta.userId && meta.userId !== authUserId) {
      this.logger.warn(
        `Socket ${client.id} userId mismatch (meta ${meta.userId} vs auth ${authUserId}), overriding with auth`,
      );
    }
    const userId = authUserId ?? meta.userId;

    await this.ensureGameState(state, !state.game);

    let resolved = this.matchPlayer(state, userId, requested);
    if (!resolved && userId && !this.isKnownPlayer(state, userId)) {
      await this.ensureGameState(state, true);
      resolved = this.matchPlayer(state, userId, requested);
    }

    if (resolved) {
      meta.player = resolved;
      if (userId) meta.userId = userId;
      this.socketRoles.set(client.id, meta);
      return resolved;
    }
    return undefined;
  }

  private matchPlayer(
    state: RoomState,
    userId?: number,
    requested?: PlayerIndex,
  ): PlayerIndex | undefined {
    if (!state.game) return undefined;
    if (userId) {
      if (state.game.player1Id === userId) return 1;
      if (state.game.player2Id === userId) return 2;
    }
    if (requested === 1 && userId && state.game.player1Id === userId) return 1;
    if (requested === 2 && userId && state.game.player2Id === userId) return 2;
    return undefined;
  }

  private getOrCreateRoomState(room: string): RoomState {
    let state = this.roomStates.get(room);
    if (!state) {
      state = this.createRoomState(room);
      this.roomStates.set(room, state);
    }
    return state;
  }

  private async ensureGameState(state: RoomState, force = false) {
    if (!force && state.game) {
      return state.game;
    }
    const latest = await this.gameService.findGameByRoom(state.room);
    if (latest) {
      state.game = latest;
    }
    return state.game;
  }

  private isKnownPlayer(state: RoomState, userId?: number): boolean {
    if (!state.game || !userId) return false;
    return (
      state.game.player1Id === userId ||
      state.game.player2Id === userId
    );
  }

  private createRoomState(room: string): RoomState {
    return {
      room,
      ball: this.createInitialBall(),
      paddles: {
        1: this.createPaddle(1),
        2: this.createPaddle(2),
      } as Record<PlayerIndex, RuntimePaddle>,
      inputs: {
        1: { up: false, down: false },
        2: { up: false, down: false },
      } as Record<PlayerIndex, InputState>,
      scores: {
        1: 0,
        2: 0,
      },
      running: false,
      lastTick: Date.now(),
    };
  }

  private createInitialBall(): RuntimeBall {
    const direction = Math.random() < 0.5 ? -1 : 1;
    return {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      vx: BALL_START_SPEED_X * direction,
      vy: BALL_START_SPEED_Y * (Math.random() < 0.5 ? -1 : 1),
      id: 0,
    };
  }

  private createPaddle(player: PlayerIndex): RuntimePaddle {
    return {
      player,
      posY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED,
    };
  }

  private resetRuntimeState(state: RoomState) {
    state.ball = this.createInitialBall();
    state.paddles[1] = this.createPaddle(1);
    state.paddles[2] = this.createPaddle(2);
    state.inputs[1] = { up: false, down: false };
    state.inputs[2] = { up: false, down: false };
    state.scores[1] = 0;
    state.scores[2] = 0;
    state.lastTick = Date.now();
    state.finishing = false;
  }

  private async prepareRoomState(room: string) {
    const state = this.getOrCreateRoomState(room);
    if (!state.running) {
      this.resetRuntimeState(state);
    }
    await this.ensureGameState(state, !state.game || !state.game.player2Id);
    return state;
  }

  private startRoomLoop(state: RoomState) {
    if (state.running) return;
    state.running = true;
    state.lastTick = Date.now();
    state.interval = setInterval(() => this.runRoomTick(state.room), SERVER_TICK_MS);
  }

  private runRoomTick(room: string) {
    const state = this.roomStates.get(room);
    if (!state || !state.running) return;
    const now = Date.now();
    const delta = (now - state.lastTick) / SERVER_TICK_MS;
    state.lastTick = now;
    this.updatePaddles(state, delta);
    this.updateBall(state, delta);
    this.broadcastState(state);
  }

  private updatePaddles(state: RoomState, delta: number) {
    const players: PlayerIndex[] = [1, 2];
    players.forEach((player) => {
      const paddle = state.paddles[player];
      const input = state.inputs[player];
      const movement = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      if (movement === 0) return;
      const offset = movement * paddle.speed * delta;
      paddle.posY = Math.min(
        Math.max(0, paddle.posY + offset),
        GAME_HEIGHT - paddle.height,
      );
    });
  }

  private updateBall(state: RoomState, delta: number) {
    const ball = state.ball;
    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;

    if (ball.y - BALL_RADIUS <= 0 || ball.y + BALL_RADIUS >= GAME_HEIGHT) {
      ball.vy = -ball.vy;
      ball.y = Math.min(Math.max(ball.y, BALL_RADIUS), GAME_HEIGHT - BALL_RADIUS);
    }

    if (this.handlePaddleCollision(state, 1)) {
      // collision handled
    } else if (this.handlePaddleCollision(state, 2)) {
      // collision handled
    }

    if (ball.x + BALL_RADIUS < 0) {
      this.handleGoal(state, 2);
      return;
    }
    if (ball.x - BALL_RADIUS > GAME_WIDTH) {
      this.handleGoal(state, 1);
      return;
    }
  }

  private handlePaddleCollision(state: RoomState, player: PlayerIndex) {
    const ball = state.ball;
    const paddle = state.paddles[player];
    const paddleLeft =
      player === 1 ? PADDLE_OFFSET : GAME_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH;
    const paddleRight = paddleLeft + PADDLE_WIDTH;
    const ballLeft = ball.x - BALL_RADIUS;
    const ballRight = ball.x + BALL_RADIUS;
    const ballTop = ball.y - BALL_RADIUS;
    const ballBottom = ball.y + BALL_RADIUS;

    if (ballRight < paddleLeft || ballLeft > paddleRight) return false;
    if (ballBottom < paddle.posY || ballTop > paddle.posY + paddle.height) return false;

    const relativeIntersectY = paddle.posY + paddle.height / 2 - ball.y;
    const normalized = relativeIntersectY / (paddle.height / 2);
    ball.vy = -normalized * BALL_MAX_SPEED_Y;
    const direction = player === 1 ? 1 : -1;
    ball.vx = direction * Math.min(BALL_MAX_SPEED_X, Math.abs(ball.vx) + 0.5);
    ball.x = direction === 1 ? paddleRight + BALL_RADIUS : paddleLeft - BALL_RADIUS;
    return true;
  }

  private handleGoal(state: RoomState, scorer: PlayerIndex) {
    state.scores[scorer] += 1;
    this.server.to(state.room).emit("scoreMessage", scorer);
    if (state.scores[scorer] >= WINNING_SCORE) {
      void this.finishMatch(state, scorer);
      return;
    }
    const serveDirection = scorer === 1 ? 1 : -1;
    this.resetBall(state, serveDirection);
  }

  private resetBall(state: RoomState, direction: number) {
    state.ball.x = GAME_WIDTH / 2;
    state.ball.y = GAME_HEIGHT / 2;
    state.ball.vx = BALL_START_SPEED_X * direction;
    state.ball.vy = BALL_START_SPEED_Y * (Math.random() < 0.5 ? -1 : 1);
  }

  private broadcastState(state: RoomState) {
    this.server.to(state.room).emit("setBall", this.serializeBall(state));
    this.server
      .to(state.room)
      .emit("paddleStateMessage", this.serializePaddle(state.paddles[1]));
    this.server
      .to(state.room)
      .emit("paddleStateMessage", this.serializePaddle(state.paddles[2]));
  }

  private serializeBall(state: RoomState): BallState {
    return {
      ballId: state.ball.id,
      ballX: state.ball.x,
      ballY: state.ball.y,
      ballVeloX: state.ball.vx,
      ballVeloY: state.ball.vy,
      player: 0,
    };
  }

  private serializePaddle(paddle: RuntimePaddle): PaddleState {
    return {
      player: paddle.player,
      posY: paddle.posY,
      height: paddle.height,
    };
  }

  private applyInput(state: RoomState, player: PlayerIndex, move: GameMove) {
    const input = state.inputs[player];
    if (!input) return;
    if (move.key === 1) {
      input.up = !move.notPressed;
    } else {
      input.down = !move.notPressed;
    }
  }

  private async finishMatch(state: RoomState, winner: PlayerIndex) {
    if (state.finishing) return;
    state.finishing = true;
    this.stopLoop(state);
    this.server.to(state.room).emit("gameEnder");
    await this.ensureGameState(state, !state.game || !state.game.player2Id);
    if (state.game?.player1Id && state.game?.player2Id) {
      const winnerId = winner === 1 ? state.game.player1Id : state.game.player2Id;
      const looserId = winner === 1 ? state.game.player2Id : state.game.player1Id;
      const score = `${state.scores[1]} - ${state.scores[2]}`;
      await this.gameService.gameToHistoric(state.game, winnerId, looserId, score);
    }
    this.roomStates.delete(state.room);
  }

  private stopLoop(state: RoomState) {
    if (state.interval) {
      clearInterval(state.interval);
      state.interval = undefined;
    }
    state.running = false;
  }

  private async teardownRoom(room: string) {
    const state = this.roomStates.get(room);
    if (!state) return;
    this.stopLoop(state);
    this.roomStates.delete(room);
  }
}
