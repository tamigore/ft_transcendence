/* eslint-disable prettier/prettier */
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Game, Historic } from "@prisma/client";
import { Matchamker } from "./dto";

@Injectable()
export class GameService {
  private logger: Logger = new Logger("GameService");
  constructor(private prisma: PrismaService) {}
  
  async matchMaker(dto: Matchamker): Promise<Game>
  {
    console.log(`typeof ${typeof(dto.userId)}`);
   

    const game = await this.prisma.$transaction(async () => {
      const game = await this.prisma.game.findFirst({
        where: {
          player2: { is: null },
        },
      })
      console.log("INMATCHMAKER : ", dto.userName);
      
      if (!game) {
        this.logger.log(`no game found creating game: ${dto.userId} ... type ${typeof(dto.userId)}`);
        return await this.prisma.game.create({
          data: {
            name: dto.userName,
            player1: {
              connect: {
                id: parseInt(dto.userId),
              }
            }
          },
          include: {
            player1: true,
            player2: true,
          }
        })
      }
      else {
        return await this.prisma.game.update({
          where: {
            id: game.id,
          },
          data: {
            player2: {
              connect: {
                id: parseInt(dto.userId),
              }
            }
          },
          include: {
            player1: true,
            player2: true,
          }
        })
      }
    })
    .then((game) => {
      this.logger.log(game)
      return game;
    })
    .catch((error) => {
      throw error;
    });
    return game;
  }

  async gameToHistoric(game: Game, _winner: number,
    _looser: number, _score: string): Promise<Historic>
  {
    if (!game)
    {
      console.log("gameToHistoric : game is null");
    }

    const historic = await this.prisma.historic.create({
      data: {
        score: _score,
        winner: {
          connect: {
            id : _winner,
          }
        },
        looser: {
          connect: {
            id : _looser,
          }
        },
        // game:
        // {
        //   connect: {
        //      id : game.id,
             
        // }
      // }
      },
      include: {
        winner: true,
        looser: true,
        // game: true,
      }

    })

    .then((historic) => {
      this.logger.log("---------YOOO LE HISTORIC : ", historic)
      return historic;
    })
    .catch((error) => {
      throw error;
    });
    return historic;
  }

  
}
