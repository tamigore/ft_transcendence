import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Message, Room } from "./interfaces"
import store from "@/store";

export interface ServerToClientEvents {
  servMessage: (e: Message) => void;
}

export interface ClientToServerEvents {
  join_room: (e: { user: User; room: Room }) => void;
  leave_room: (e: { user: User; room: Room }) => void;
  kick_user: (e: { user: User; user_to_kick: User; room: Room }) => void;
  cliMessage: (e: Message) => void;
  privMessage: (e: { user1: User, user2: User, message: Message }) => void;
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
    this.socket.on('servMessage', (msg: Message) => {
      console.log(msg);
      store.commit("setLastMessage", msg);
    });
  }
}

const socket = new SocketioChat().socket;

export default socket;