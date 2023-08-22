export class Matchmaker {
  userId: number;
  userName: string;
  isBlocked: boolean;
}

export class Spectate {
  userId: number;
  userName: string;
  userPlaying: number;
}

export interface GameMove {
  player: number;

  notPressed: boolean;
  key: number;
  gameRoom: string;
}

export interface BallState {
  ballId: number;
  ballX: number;
  ballY: number;
  ballVeloX: number;
  ballVeloY: number;
  player: number;
}

export interface BlockState {
  effect: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  id: number;
}

export interface PaddleState {
  player: number;
  posY: number;
  height: number;
}

export interface GameScore {
  scoreA: number;
  scoreB: number;
}
