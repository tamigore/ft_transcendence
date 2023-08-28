export interface User {
  id: number,
  created_at: Date,
  updated_at: Date,
  
  email: string,
  username: string,
  hash: string,
  hashRt: string | null,
  chatSocket: string | null,
  gameSocket: string | null,
  loggedIn: boolean,
  bio: string | null,
  img: string | null, //Path to img src
  twoFA: string | null,
  twoFAState: boolean,
  friend: User[],
  friendBy: User[],
  blocked: User[],
  blockedBy: User[],
  owner: Room[],
  admin: Room[],
  rooms: Room[],
  ban: Room[],
  mute: Room[],
  messages: Message[],
  player1: Game[],
  player2: Game[],
  spectator: Game[],
  win: Historic,
  loose: Historic,
  ingame: boolean,
  inqueue: boolean,
}

export interface Game {
  id: number,
  created_at: Date,

  isBlocked: boolean,
  name: string
  player1Id: number,
  player1: User,
  player2Id: number,
  player2: User,
  spectator: User[],
  historic: Historic | null,
}

export interface Historic {
  id: number,
  created_at: Date,

  winnerID: number,
  winner: User,
  looserID: number,
  looser: User,
  score: string,
}

export interface Message {
  id: number,
  created_at: Date,

  text: string,
  roomId: number,
  room: Room,
  userId: number,
  user: User,
}

export interface Room {
  id: number,
  created_at: Date,

  name: string,
  private: boolean,
  hash: string | null,
  ownerId: number,
  owner: User,
  admins: User[],
  users: User[],
  ban: User[],
  mute: User[],
  messages: Message[],
}

export interface GameMove {
  player: number,

  notPressed: boolean,
  key: number,
  gameRoom: string,
}


export interface BlockState
{
  effect: string,
  x: number,
  y: number,
  width: number,
  height: number,
  num: number,
  id: number,
}

export interface BallState
  {
		ballId: number;
		ballX: number;
		ballY: number;
		ballVeloX: number;
		ballVeloY: number;
		player: number;
  }

export interface PaddleState
{
  player: number,
  posY: number,
  height: number,
}

