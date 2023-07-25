import { io, Socket  } from "socket.io-client";
import { server } from "@/utils/helper";
import store from "@/store";
import { User, Message, Room } from "./interfaces"

export interface ServerToClientEvents {
  up: (e: {user: User, room: Room}) => void;
  down: (e: {user: User, room: Room}) => void;
  upNo: (e: {user: User, room: Room}) => void;
  downNo: (e: {user: User, room: Room}) => void;
}

export interface ClientToServerEvents {
  up: (e: {user: User, room: Room}) => void;
  down: (e: {user: User, room: Room}) => void;
  upNo: (e: {user: User, room: Room}) => void;
  downNo: (e: {user: User, room: Room}) => void;
  join_room: (e: { user: User; room: Room }) => void;
}

class SocketioGame {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
	constructor()
	{
		const auth: string = "Bearer " + store.state.user.hash;
		const userId: string = store.state.user.id.toString();
		this.socket = io(server.gameUrl,
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
	};
}

const socket = new SocketioGame().socket;

export default socket;
