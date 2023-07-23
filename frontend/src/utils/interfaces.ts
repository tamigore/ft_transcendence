export interface User {
  id: number;
  created_at: Date;
  updated_at: Date;
  
  email: string;
  username: string | null;
  hash: string;
  hashRt: string | null;
  chatSocket: string | null;
  gameSocket: string | null;
  loggedIn: boolean;
  bio: string | null,
  img: string | null, //Path to img src
  owner: Room[];
  admin: Room[];
  rooms: Room[];
  messages: Message[];
  win: Historic;
  loose: Historic;
}

export interface Historic {
  id: number;
  created_at: Date;

  winnerID: number;
  winner: User;
  looserID: number;
  looser: User;
  score: string;
}

export interface Message {
  id: number;
  created_at: Date;

  text: string;
  roomId: number
  room: Room
  userId: number;
  user: User;
}

export interface Room {
  id: number;
  created_at: Date;

  name: string;
  ownerId: number;
  owner: User;
  admin: User[];
  users: User[];
  messages: Message[];
  description: string | null;
}