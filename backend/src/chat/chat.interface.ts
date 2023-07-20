import { User, Message, Room } from "@prisma/client";
import { Socket } from "socket.io";

export interface ServerToClientEvents {
  servMessage: (e: Message) => void;
}

export interface ClientToServerEvents {
  join_room: (e: { user: User; roomName: string }) => void;
  kick_user: (e: { user: User; user_to_kick: User; roomName: string }) => void;
  cliMessage: (e: Message) => void;
}

export interface JoinRoom {
  user: User;
  room: Room;
  event: string;
}

export interface KickUser {
  user: User;
  userToKick: User;
  room: Room;
  eventName: string;
}

export interface MessageEvent {
  user: User;
  room: Room;
  socket: Socket;
}
