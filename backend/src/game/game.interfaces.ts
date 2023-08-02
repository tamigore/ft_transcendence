import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Game } from "@prisma/client";
import { Matchamker } from "./dto";

export interface GameMove {
    player: number,
  
    up: boolean,
    key: number,
  }

  export interface BallState
  {
    ballX: number,
    ballY: number,
    ballVeloX: number,
    ballVeloY: number,
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