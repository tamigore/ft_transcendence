import { reactive } from "vue";
import { io, Socket  } from "socket.io-client";
import { server } from "@/helper";

class message {
  username: string;
  text: string;
  object: string;
  channel: string;
}

interface ServerToClientEvents {
  servMessage: (message: message) => void;
}

interface ClientToServerEvents {
  cliMessage: (message: message) => void;
}

class SocketioChat {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  state = reactive({
    connected: false as boolean,
    hostname: server.chatUrl,
    msgEvents: [] as string[],
    // errorEvents: [] as string[],
  });
  
  setupSocketConnection() {
    console.log("setupSocketConnection");
    this.socket = io(server.chatUrl, { transports : ['websocket', 'polling', 'flashsocket']});
      this.state.connected = true;
    // this.socket.connect();
  }

  socketConnect() {
    console.log("socketConnect");
    this.socket.on("connect", () => {
      this.state.connected = true;
      console.log("Socket connect");
    });
  }
  
  socketDisconnect() {
    console.log("socketDisconnect");
    this.socket.on("disconnect", () => {
      this.state.connected = false;
      console.log("Socket disconnect");
    });
  }

  socketMessage() {
    this.socket.on("servMessage", (...args: any) => {
      this.state.msgEvents.push(args);
      console.log("Socket msg");
    });
  }
  
  // socketReconnectAttempt() {
  //   this.socket.on("reconnect_attempt", () => {
  //     state.connected = false;
  //     console.log("Socket reconnect_attempt");
  //   });
  // }
  
  // socketReconnect() {
  //     this.socket.on("reconnect", () => {
  //     state.connected = true;
  //     console.log("Socket reconnect");
  //   });
  // }

  // this.socket.on("reconnect_failed", () => {
  //   state.connected = false;
  //   console.log("Socket reconnect_failed");
  // });
  
  // this.socket.on("connect_error", () => {
  //   console.log("connect_error");
  // });
  
  // this.socket.on("connect_failed", () => {
  //   console.log("connect_failed");
  // });
  
  // this.socket.on("ping", () => {
  //   state.logEvents.push("ping");
  //   console.log("ping");
  // });
}

export default new SocketioChat();

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://:3000";
// export const socket = io(URL, { transports : ['websocket', 'polling', 'flashsocket']});
