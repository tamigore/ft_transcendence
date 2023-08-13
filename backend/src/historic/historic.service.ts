/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Historic } from "@prisma/client";

@Injectable()
export class HistoricService {
  private logger: Logger = new Logger("HistoricService");
  constructor(private prisma: PrismaService) {}
  
  async getGamesByPlayerId(body: any) : Promise<Historic[]> {
    let userId = 0;
    userId = + body.id;
    const messages = await this.prisma.historic.findMany({
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

  async getGameByGameId(body: any) : Promise<Historic> {
      let id = 0;
      id = + body.id;
    const message = await this.prisma.historic.findUnique({
      where: {
        id: id ,
      }
    });
    if (!message) throw new ForbiddenException("Access Denied");
    return message;
  }

  // async setGameByGameId(body: any) : Promise<void> {
  //   let winnerID = 0;
  //   winnerID = + body.winnerID;
  //   let looserID = 0;
  //   looserID = + body.looserID;

  //   await this.prisma.historic
  //     .create({
  //       data: {
  //         winner: {
  //           connect: {
  //             id: winnerID,
  //           },
  //         },
  //         looser: {
  //           connect: {
  //             id: looserID,
  //           },
  //         },
  //         score : body.score,
  //         game : {
  //           connect : {
  //             id : body.gameId
  //           }
  //         }
  //       },
  //     })
  //     .catch((error: any) => {
  //       this.logger.log("", error)
  //     });
  //   }
    
}
