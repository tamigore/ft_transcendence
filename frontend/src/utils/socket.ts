import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import { User, Message, Room } from "./interfaces"
import store from "@/store";
import axios, { AxiosResponse, AxiosError } from "axios";
import gameSocket from "./gameSocket";
import router from "@/router";

export interface ServerToClientEvents {
  servMessage: (e: Message) => void;
  update: () => void;
  updatePrivate: () => void;
  inviteGame: (e: { user1: User; user2: User }) => void;
  pongGame1: () => void;
  pongGame2: (e: { user1: User; user2: User }) => void;
}

export interface ClientToServerEvents {
  join_room: (e: { user: User; room: Room }) => boolean;
  leave_room: (e: { user: User; room: Room }) => boolean;
  kick_user: (e: { user: User; user_to_kick: User; room: Room }) => boolean;
  cliMessage: (e: Message) => boolean;
  update: (e: { room: Room }) => void;
  acceptInvite: (e: { user1: User; user2: User }) => void;
  inviteGame: (e: { user1: User; user2: User }) => void;
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
          return ;
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
          store.commit("setRooms", response.data);
          for (const room of rooms)
          {
            if (room.id === store.state.lastRoom.id)
            {
              if (room.users && !room.users.find(user => user.id === store.state.user.id))
                store.commit("setLastRoom", {});
              else
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
          }
        })
        .catch((error: AxiosError) => { throw error; });
    });

    this.socket.on('updatePrivate', async () => {
      await axios.get(`api/room/private/${store.state.user.id}`, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      })
        .then(async (response: AxiosResponse) => {
          const rooms = response.data as Room[];
          store.commit("setPrivate", rooms);
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
        })
        .catch((error: AxiosError) => { throw error; });
    });

    this.socket.on("connect", async () => {
      console.log(this.socket.id)
      await axios.post("/api/user/chatsocket", { socket: this.socket.id }, {
        headers: { "Authorization": `Bearer ${store.state.user.hash}` }
      });
      store.commit("setChatSocket", this.socket.id);
    });


    this.socket.on("connect_error", () => {
      console.log("Ws connect failed");
    });

    this.socket.on("inviteGame", async (e: {user1: User, user2: User}) => {
      console.log("invite received");
      // const res = await window.confirm(`User: ${e.user1.username} want to invite you to a pong game.`)
      // if (res) {
      console.log("pongGame accept invite");
      store.commit("setInQueue", true);
      store.commit("setGameRoom", e.user1.username);
      gameSocket.emit("inviteJoinGameRoom", { room: e.user1.username as string });
      gameSocket.emit("inviteGame", {
        user1username: e.user1.username,
        user2username: store.state.user.username,
      });
      router.push({path: "/pong"});
      // }
    });

    // this.socket.on("pongGame1", () => {
    //   console.log("invite friend");
    //   store.commit("setInQueue", true);
    //   store.commit("setGameRoom", store.state.user.username);
    //   gameSocket.emit("inviteJoinGameRoom", { room: store.state.user.username as string });
    //   console.log("invite friend END");
    //   router.push({path: "/pong"});
    // });

    // this.socket.on("pongGame2", (e: {user1: User, user2: User}) => {
    //   console.log("pongGame accept invite");
		// 	store.commit("setInQueue", true);
		// 	store.commit("setGameRoom", e.user1.username);
		// 	gameSocket.emit("inviteJoinGameRoom", { room: e.user1.username as string });
		// 	gameSocket.emit("inviteGame", {
		// 		user1username: e.user1.username,
		// 		user2username: store.state.user.username,
		// 	});
    //   router.push({path: "/pong"});
    // });
  }
}

const socket = new SocketioChat().socket;

export default socket;