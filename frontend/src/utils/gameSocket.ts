import { io, Socket } from "socket.io-client";
import { server } from "@/utils/helper";
import { User , GameMove, BallState, PaddleState} from "./interfaces"

export interface ServerToClientEvents {


  servMessage(e: GameMove): void;
  paddleStateMessage(e: PaddleState): void;
  pongMessage(e: {ballInfo: BallState, PaddleInfo: PaddleState}): void;
  gameRoomJoiner(e: { user : User, room : string }): void;

}

export interface ClientToServerEvents {

  gameMessage(e: { moove: GameMove, room: string}): void;
  paddlePosMessage(e: { state: PaddleState, room: string}): void;
  pingMessage(e: {ballInfo: BallState, room: string}): void;
  joinGameRoom (e: { user: User; room : string }): void;
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
  }
}

const socket = new SocketioGame().socket;

export default socket;
