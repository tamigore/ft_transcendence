import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import store from "@/store";

interface ServerToClientEvents {
  servMessage: (message: {username: string, text: string, object: string, channel: string}) => void;
}

interface ClientToServerEvents {
  cliMessage: (message: {username: string, text: string, object: string, channel: string}) => void;
  joinChan: (message: {chan: string}) => void;
}

class SocketioChat {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  setupSocketConnection() {
    const auth = "Bearer " + store.state.user.hashRT;
    this.socket = io(server.chatUrl,
      {
        transports : ['websocket'],
        autoConnect: true,
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
    this.socket.on("servMessage", (args:  {username: string, text: string, object: string, channel: string}) => {
      console.log("Socket msg : ", args);
      store.commit("setChatMessages", args);
      if (store.state.chat.channels.includes(args.channel) === false)
        store.commit("setChatChannels", args.channel);
      if (store.state.chat.channel != args.channel)
        store.commit("setChatChannel", args.channel);
    });
  }
}

export default new SocketioChat();