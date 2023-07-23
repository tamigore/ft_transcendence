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
    const auth: string = "Bearer " + store.state.user.hash;
    const userId: string = store.state.user.id.toString();
    this.socket = io(server.chatUrl,
      {
        transports : ['websocket'],
        autoConnect: false,
        auth: {
          token: auth,
        },
        query: {
          "userId": userId,
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
      console.log("socketDisconnect");
      store.commit("setChatConnect", true);
      store.commit("setChatSocket", this.socket.id);
    });
  }
  
  socketDisconnect() {
    this.socket.on("disconnect", () => {
      console.log("socketDisconnect");
      store.commit("setChatConnect", false);
      store.commit("setChatSocket", "");
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

// const socketio = new SocketioChat();

// export default socketio;