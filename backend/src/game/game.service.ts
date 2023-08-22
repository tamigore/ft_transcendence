import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Game, Historic } from "@prisma/client";
import { Matchmaker, Spectate } from "./game.interfaces";

@Injectable()
export class GameService {
  private logger: Logger = new Logger("GameService");
  constructor(private prisma: PrismaService) { }

  async matchMaker(dto: Matchmaker): Promise<Game> {
    console.log(`typeof ${typeof (dto.userId)}`);
    const game = await this.prisma.$transaction(async () => {
      const game = await this.prisma.game.findFirst({
        where: {
          player2: { is: null },
          //isBlocked: dto.isBlocked as boolean,
        },
      })
      console.log("INMATCHMAKER : ", dto.userName);

      if (!game) {
        this.logger.log(`no game found creating game: ${dto.userId} ... type ${typeof (dto.userId)}`);
        return await this.prisma.game.create({
          data: {
            // isBlocked: dto.isBlocked,
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
            // isBlocked: dto.isBlocked,
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

  async SpectateGame(dto: Spectate): Promise<Game> {
    const game = await this.prisma.$transaction(async () => {
      const game = await this.prisma.game.findFirst({
        where: {
          OR: [
            { player1Id: dto.userPlaying },
            { player2Id: dto.userPlaying }
          ]
        },
      });

      if (game) {
        return await this.prisma.game.update({
          where: {
            id: game.id,
          },
          data: {
            spectator: {
              connect: { username: dto.userName }
            },
          },
          include: {
            player1: true,
            player2: true,
            spectator: true,
          },
        });
      }
      return (null);
    });
    return game;
  }

  async gameToHistoric(game: Game, _winner: number, _looser: number, _score: string): Promise<Historic> {
    if (!game) {
      console.log("gameToHistoric : game is null");
    }

    const historic = await this.prisma.historic.create({
      data: {
        score: _score,
        winner: {
          connect: {
            id: _winner,
          }
        },
        looser: {
          connect: {
            id: _looser,
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

// import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
// import { GameService } from "./game.service";
// import { Public } from "../common/decorators";
// import { Game } from "@prisma/client";
// import { Matchmaker, Spectate } from "./game.interfaces";

// @Controller("game")
// export class GameController {
//   constructor(private gameService: GameService) {}

//   @Public()
//   @Post("matchmaker")
//   @HttpCode(HttpStatus.OK)
//   setGameFromId(@Body() dto: Matchmaker): Promise<Game> {
//     return this.gameService.matchMaker(dto);
//   }

//   @Public()
//   @Post("spectate")
//   setGameSpectator(@Body() dto: Spectate): Promise<Game> {
//     return this.gameService.SpectateGame(dto);
//   }
// }





/* eslint-disable prettier/prettier */
// import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
// import { PrismaService } from "../prisma/prisma.service";
// import { Historic } from "@prisma/client";

// @Injectable()
// export class HistoricService {
//   private logger: Logger = new Logger("HistoricService");
//   constructor(private prisma: PrismaService) {}
  
//   async getGamesByPlayerId(body: any) : Promise<Historic[]> {
//     let userId = 0;
//     userId = + body.id;
//     const messages = await this.prisma.historic.findMany({
//       where: {
//         OR: [
//             {
//                 winnerID: userId,
//             },
//             {
//                 looserID: userId,
//             },
//         ],
//       }
//     });
//     if (!messages) throw new ForbiddenException("Access Denied");
//     return messages;
//   }

//   async getGameByGameId(body: any) : Promise<Historic> {
//       let id = 0;
//       id = + body.id;
//     const message = await this.prisma.historic.findUnique({
//       where: {
//         id: id ,
//       }
//     });
//     if (!message) throw new ForbiddenException("Access Denied");
//     return message;
//   }

//   async setGameByGameId(body: any) : Promise<void> {
//     let winnerID = 0;
//     winnerID = + body.winnerID;
//     let looserID = 0;
//     looserID = + body.looserID;

//     await this.prisma.historic
//       .create({
//         data: {
//           winner: {
//             connect: {
//               id: winnerID,
//             },
//           },
//           looser: {
//             connect: {
//               id: looserID,
//             },
//           },
//           score : body.score,
//           game : {
//             connect : {
//               id : body.gameId
//             }
//           }
//         },
//       })
//       .catch((error: any) => {
//         this.logger.log("", error)
//       });
//     }
    
// }
