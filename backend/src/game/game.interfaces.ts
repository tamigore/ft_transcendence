import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Game, User, Room } from "@prisma/client";
import { Matchamker } from "./dto";

export interface GameMove {
    player: number,
  
    notPressed: boolean,
    key: number,
    gameRoom: string,
  }

  export interface BallState
  {
    ballX: number,
    ballY: number,
    ballVeloX: number,
    ballVeloY: number,
    player: number,
  }

  export interface BlockState
{
  effect: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  id: number,
}

  export interface PaddleState
  {
    player: number,
    posY: number,
  }

  export interface GameScore
  {
    scoreA: number,
    scoreB: number,
  }
