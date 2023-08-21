import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Message, Room } from "./interfaces"
import store from "@/store";
import axios, { AxiosResponse, AxiosError } from "axios";
export interface ServerToClientEvents {
  servMessage: (e: Message) => void;
  update: () => void;
}

export interface ClientToServerEvents {
  join_room: (e: { user: User; room: Room }) => boolean;
  leave_room: (e: { user: User; room: Room }) => boolean;
  kick_user: (e: { user: User; user_to_kick: User; room: Room }) => boolean;
  cliMessage: (e: Message) => boolean;
}

class SocketioChat {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  constructor() {
    console.log("setupSocketConnection");
    this.socket = io(server.chatUrl,
      {
        transports : ['websocket'],
        autoConnect: false,
        upgrade: false,
      }
    );
    this.socket.on('servMessage', (msg: Message) => {
      if (store.state.lastRoom.id === msg.room.id)
        store.commit("addMessage", msg);
      else if (store.state.lastPrivate.id === msg.room.id)
        store.commit("addMessage", msg);
      else
        store.commit("setLastMessage", msg);
    });
    this.socket.on('update', async () => {
      await axios.get("api/room/public", {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then(async (response: AxiosResponse) => {
          const rooms = response.data as Room[];
          for (const room of rooms)
          {
            if (room.id === store.state.lastRoom.id)
            {
              await axios.get(`api/chat/room/${room.id}`, {
                headers: { "Authorization": `Bearer ${store.state.user.hash}` }
              })
                .then((response: AxiosResponse) => {
                  store.commit("setMessages", response.data);
                })
                .catch((error: AxiosError) => { throw error; });
            }
          }
          store.commit("setRooms", response.data);
        })
        .catch((error: AxiosError) => { throw error; });
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