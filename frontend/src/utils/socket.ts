import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Message } from "./interfaces"

export interface ServerToClientEvents {
  servMessage: (e: {message: Message}) => void;
}

export interface ClientToServerEvents {
  join_room: (e: { user: User; roomName: string }) => void;
  kick_user: (e: { user: User; user_to_kick: User; roomName: string }) => void;
  cliMessage: (e: {message: Message}) => void;
  privMessage: (e: {message: Message}) => void;
}

class SocketioChat {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  constructor() {
    console.log("setupSocketConnection");
    this.socket = io(server.chatUrl,
      {
        transports : ['websocket'],
        autoConnect: false,
      }
    );
  }
}

const socket = new SocketioChat().socket;

export default socket;