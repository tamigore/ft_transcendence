import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Message, Room } from "./interfaces"
import store from "@/store";
import axios from "axios";
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
      if (store.state.lastRoom.id === msg.room.id)
        store.commit("addMessage", msg);
      else
        store.commit("setLastMessage", msg);
    });
    this.socket.on("connect", () => {
      axios.post("/api/user/chatsocket", { socket: socket.id }, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      });
    });
    this.socket.on("connect_error", () => {
      console.log("Ws connect failed");
    });
  }
}

const socket = new SocketioChat().socket;

export default socket;