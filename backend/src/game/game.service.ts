import { PrismaService } from "../prisma/prisma.service";
import { Game } from "@prisma/client";
import { Matchmaker, Spectate } from "./game.interfaces";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class GameService {
  private logger: Logger = new Logger("GameService");
  constructor(private prisma: PrismaService) {}

  async findSpectate() {
    return await this.prisma.game.findMany({
      where: {
        player2: { isNot: null },
        historic: { is: null },
      },
      include: {
        player1: true,
        player2: true,
      },
    });
  }

  async matchMaker(dto: Matchmaker): Promise<Game> {
    console.log(`typeof ${typeof dto.userId}`);
    const game = await this.prisma
      .$transaction(async () => {
        const game = await this.prisma.game.findFirst({
          where: {
            player2: { is: null },
            //isBlocked: dto.isBlocked as boolean,
          },
        });
        console.log("INMATCHMAKER : ", dto.userName);

        if (!game) {
          this.logger.log(
            `no game found creating game: ${
              dto.userId
            } ... type ${typeof dto.userId}`,
          );
          return await this.prisma.game.create({
            data: {
              // isBlocked: dto.isBlocked,
              name: dto.userName,
              player1: {
                connect: {
                  id: dto.userId,
                },
              },
            },
            include: {
              player1: true,
              player2: true,
            },
          });
        } else {
          return await this.prisma.game.update({
            where: {
              id: game.id,
              // isBlocked: dto.isBlocked,
            },
            data: {
              player2: {
                connect: {
                  id: dto.userId,
                },
              },
            },
            include: {
              player1: true,
              player2: true,
            },
          });
        }
      })
      .then((game) => {
        this.logger.log(game);
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
          id: dto.gameId,
          historic: { is: null },
        },
      });

      if (game) {
        return await this.prisma.game.update({
          where: {
            id: game.id,
          },
          data: {
            spectator: {
              connect: { username: dto.userName },
            },
          },
          include: {
            player1: true,
            player2: true,
            spectator: true,
          },
        });
      }
      return game;
    });
    return game;
  }

  async gameToHistoric(
    game: Game,
    _winner: number,
    _looser: number,
    _score: string,
  ) {
    if (!game) {
      console.log("gameToHistoric : game is null");
    }
    return await this.prisma.historic
      .create({
        data: {
          score: _score,
          winner: {
            connect: {
              id: _winner,
            },
          },
          looser: {
            connect: {
              id: _looser,
            },
          },
          game: {
            connect: {
              id: game.id,
            },
          },
        },
        include: {
          winner: true,
          looser: true,
          game: true,
        },
      })
      .then((historic) => {
        this.logger.log("---------YOOO LE HISTORIC : ", historic);
        return historic;
      })
      .catch((error) => {
        throw error;
      });
  }
}
