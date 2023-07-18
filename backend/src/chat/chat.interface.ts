import { User, Message, Room } from "@prisma/client";

export interface ServerToClientEvents {
  chat: (e: Message) => void;
  servMessage: (e: Message) => void;
}

export interface ClientToServerEvents {
  chat: (e: Message) => void;
  join_room: (e: { user: User; roomName: string }) => void;
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
