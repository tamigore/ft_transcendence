import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import store from "@/store";
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

  setupSocketConnection() {
    console.log("setupSocketConnection");
    const auth = "Bearer " + store.state.user.hash;
    this.socket = io(server.chatUrl,
      {
        transports : ['websocket'],
        autoConnect: false,
        auth: {
          token: auth,
        },
      }
    );
    store.commit("setChatConnect", false);
    this.socketConnect();
    this.socketDisconnect();
    this.socketMessage();
  }
    
  socketConnect() {
    this.socket.on("connect", () => {
      store.commit("setChatConnect", true);
      store.commit("setChatSocket", this.socket.id);
      console.log("Socket connect : " + this.socket.id);
    });
  }
  
  socketDisconnect() {
    this.socket.on("disconnect", () => {
      store.commit("setChatConnect", false);
      store.commit("setChatSocket", "");
      console.log("Socket disconnect");
    });
  }

  socketMessage() {
    this.socket.on("servMessage",
    (message:  {user: User, room: Room, message: Message}) => {
      console.log("Socket msg : ", message);
      store.commit("setMessages", message);
    });
  }
}

export default new SocketioChat();