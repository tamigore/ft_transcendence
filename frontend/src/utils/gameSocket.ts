import { io, Socket } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Game } from "./interfaces"

export interface ServerToClientEvents {
  up: (e: { user: User, game: Game }) => void;
  down: (e: { user: User, game: Game }) => void;
  upNo: (e: { user: User, game: Game }) => void;
  downNo: (e: { user: User, game: Game }) => void;
}

export interface ClientToServerEvents {
  up: (e: { user: User, game: Game }) => void;
  down: (e: { user: User, game: Game }) => void;
  upNo: (e: { user: User, game: Game }) => void;
  downNo: (e: { user: User, game: Game }) => void;
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
