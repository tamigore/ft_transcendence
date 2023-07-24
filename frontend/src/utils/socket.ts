import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Message, Room } from "./interfaces"

export interface ServerToClientEvents {
  servMessage: (e: {user: User, room: Room, message: Message}) => void;
}

export interface ClientToServerEvents {
  join_room: (e: { user: User; roomName: string }) => void;
  kick_user: (e: { user: User; user_to_kick: User; roomName: string }) => void;
  cliMessage: (e: {user: User, room: Room, message: Message}) => void;
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