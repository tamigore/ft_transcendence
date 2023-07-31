import { User, Message, Room } from "@prisma/client";

export interface ServerToClientEvents {
  servMessage: (e: Message) => void;
}

export interface ClientToServerEvents {
  join_room: (e: { user: User; room: Room }) => void;
  leave_room: (e: { user: User; room: Room }) => void;
  kick_user: (e: { user: User; userToKick: User; room: Room }) => void;
  cliMessage: (e: Message) => void;
  privMessage: (e: { user1: User; user2: User; message: Message }) => void;
}
