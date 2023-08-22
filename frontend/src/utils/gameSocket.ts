import { io, Socket } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Game, GameMove, BallState, PaddleState, BlockState } from "./interfaces"
import axios from 'axios';
import store from '@/store';

export interface ServerToClientEvents {
  servMessage(e: GameMove): void;
  paddleStateMessage(e: PaddleState): void;
  pongMessage(e: { ballInfo: BallState, PaddleInfo: PaddleState }): void;
  gameRoomJoiner(e: { user: User, room: string }): void;
  LaunchGame(e: BallState): void;
  setBall(e: BallState): void;
  ballPong(e: BallState): void;
  scoreMessage(player: number): void;
  blockCreation(e: BlockState): void;
  blockDestruction(e: number): void;
  ballDestruction(e: number): void;
  ballCreation(e: BallState): void;
  gameEnder(): void;

  servNewSpectator(e: { user: User }): void;
  servOnSpecBlock(e: {block: BlockState, userId : number }): void;
  servOnSpecBall(e: { ball: BallState, userId : number }): void;
  servOnSpecPaddle(e: { paddle: PaddleState, userId : number }): void;
}

export interface ClientToServerEvents {
  endGame(e: { room: string, game: Game, winner: number, looser: number, score: string }): void;
  createBlock(e: { room: string, block: BlockState }): void;
  destroyBlock(e: { room: string, blockId: number }): void;
  createBall(e: { room: string, ball: BallState }): void;
  destroyBall(e: { room: string, ballId: number }): void;
  goalMessage(e: { room: string, player: number }): void;
  ballPing(e: { ballInfo: BallState, room: string }): void;
  ReadyGame(e: { room: string, ball: BallState }): void;
  gameMessage(e: { moove: GameMove, room: string }): void;
  paddlePosMessage(e: { state: PaddleState, room: string }): void;
  pingMessage(e: { ballInfo: BallState, room: string }): void;
  joinGameRoom(e: { user: User; room: string }): void;
  ballSetter(e: { ballInfo: BallState, room: string }): void;
  gameLeave(e: { room: string, player: number }): void;

  newSpectator(e: { room: string, user: User }): void;
  onSpecBlock(e: { room: string, block: BlockState, userId : number }): void;
  onSpecBall(e: { room: string, ball: BallState, userId : number }): void;
  onSpecPaddle(e: { room: string, paddle: PaddleState, userId : number }): void;
}

class SocketioGame {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  constructor() {
    this.socket = io(server.gameUrl,
      {
        transports: ['websocket'],
        autoConnect: false,
      }
    );
    this.socket.on("connect", () => {
      axios.post("/api/user/gamesocket", { socket: socket.id }, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      });
    });
    this.socket.on("connect_error", () => {
      console.log("Ws connect failed");
    });
  }
}

const socket = new SocketioGame().socket;

export default socket;
