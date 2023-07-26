/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Game } from "@prisma/client";

@Injectable()
export class GameService {
  private logger: Logger = new Logger("GameService");
  constructor(private prisma: PrismaService) {}
  
  async getGamesByPlayerId(body: any) : Promise<Game[]> {
    let userId = 0;
    userId = + body.id;
    const messages = await this.prisma.game.findMany({
      where: {
        OR: [
            {
                player1Id: userId,
            },
            {
                player2Id: userId,
            },
        ],
      }
    });
    if (!messages) throw new ForbiddenException("Access Denied");
    return messages;
  }

  async getGameByGameId(body: any) : Promise<Game> {
      let id = 0;
      id = + body.id;
    const message = await this.prisma.game.findUnique({
      where: {
        id: id ,
      }
    });
    if (!message) throw new ForbiddenException("Access Denied");
    return message;
  }

  async setGameByGameId(body: any) : Promise<void> {
    let winnerID = 0;
    winnerID = + body.winnerID;
    let looserID = 0;
    looserID = + body.looserID;

    await this.prisma.game
      .create({
        data: {
			name: "Game data",
          player1: {
            connect: {
              id: winnerID,
            },
          },
          player2: {
            connect: {
              id: looserID,
            },
          },
        },
      })
      .catch((error: any) => {
        this.logger.log("", error)
      });
    }
}
