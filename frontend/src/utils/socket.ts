import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Message, Room } from "./interfaces"
import store from "@/store";
import axios, { AxiosResponse, AxiosError } from "axios";
export interface ServerToClientEvents {
  servMessage: (e: Message) => void;
  update: () => void;
  updatePrivate: () => void;
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
      console.log("new servMessage" + msg);
      if (store.state.lastRoom.id === msg.room.id) {
        console.log("last Room == message.room");
        if ((store.state.lastRoom.mute && store.state.lastRoom.mute.find(user => user.id === msg.user.id))
          || (store.state.user.blocked && store.state.user.blocked.find(user => user.id === msg.user.id)))
          store.commit("setLastMessage", msg);
        else
          store.commit("addMessage", msg);
      }
      else if (store.state.lastPrivate.id === msg.room.id) {
        console.log("last private == message.room");
        store.commit("addMessage", msg);
      }
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

    this.socket.on('updatePrivate', async () => {
      await axios.get(`api/room/private/${store.state.user.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then(async (response: AxiosResponse) => {
          const rooms = response.data as Room[];
          for (const room of rooms)
          {
            if (room.id === store.state.lastPrivate.id)
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