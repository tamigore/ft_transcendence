import { io, Socket } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Game , GameMove} from "./interfaces"

export interface ServerToClientEvents {


  servMessage(e: GameMove): void;

}

export interface ClientToServerEvents {


  gameMessage(e: GameMove): void;

  join_game: (e: { user: User; game: Game }) => void;
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
