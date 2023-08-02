import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Game } from "@prisma/client";
import { Matchamker } from "./dto";

export interface GameMove {
    player: number,
  
    up: boolean;
    key: number;
  }
