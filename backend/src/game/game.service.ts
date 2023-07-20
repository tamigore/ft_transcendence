/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GameHistoric } from "@prisma/client";

@Injectable()
export class HistoricService {
  private logger: Logger = new Logger("HistoricService");
  constructor(private prisma: PrismaService) {}
  
  async getGamesByPlayerId(body: any) : Promise<GameHistoric[]> {
    let userId : number = 0;
    userId = + body.id;
    const messages = await this.prisma.gameHistoric.findMany({
      where: {
        OR: [
            {
                winnerID: userId,
            },
            {
                looserID: userId,
            },
        ],
      }
    });
    if (!messages) throw new ForbiddenException("Access Denied");
    return messages;
  }

  async getGameByGameId(body: any) : Promise<GameHistoric> {
      let id : number = 0;
      id = + body.id;
    const message = await this.prisma.gameHistoric.findUnique({
      where: {
        id: id ,
      }
    });
    if (!message) throw new ForbiddenException("Access Denied");
    return message;
  }

  async setGameByGameId(body: any) : Promise<void> {
    let winnerID : number = 0;
    winnerID = + body.winnerID;
    let looserID : number = 0;
    looserID = + body.looserID;

    await this.prisma.gameHistoric
      .create({
        data: {
          winnerID: winnerID,
          looserID: looserID,
          score : body.score,
        },
      })
      .catch((error: any) => {
        this.logger.log("", error)
      });
    }
    
}
