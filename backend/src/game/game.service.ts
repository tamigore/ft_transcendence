import { PrismaService } from "../prisma/prisma.service";
import { Game } from "@prisma/client";
import { UserService } from "../user//user.service";
import { Matchmaker, Spectate } from "./game.interfaces";
import { Injectable, Logger } from "@nestjs/common";
// import { Server } from "socket.io";
// import { WebSocketServer } from "@nestjs/websockets";

@Injectable()
export class GameService {
  private logger: Logger = new Logger("GameService");
  constructor(
    private prisma: PrismaService,
    private userServ: UserService,
  ) {}

  // @WebSocketServer()
  // server: Server;

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

  async updateInGame(userId: number, value: boolean) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ingame: value,
      },
    });
  }

  async updateInQueue(userId: number, value: boolean) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        inqueue: value,
      },
    });
  }

  async queueLeave(gameId: number) {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
      },
    });
    if (!game) return;
    return await this.prisma.game
      .delete({
        where: {
          id: gameId,
        },
      })
      .then(() => {
        console.log("queueLeave : game deleted");
      })
      .catch(() => {
        return null;
      });
  }

  async inviteGame(dto: {
    user1username: string;
    user2username: string;
  }): Promise<Game> {
    const user1 = await this.userServ.findByUsername(dto.user1username);
    const user2 = await this.userServ.findByUsername(dto.user2username);

    if (!user1 || !user2) {
      console.log("echec cuisant");
      return null;
    }
    const game = await this.prisma.game.create({
      data: {
        name: "onInvite",
        isBlocked: false,
        player1: {
          connect: {
            id: user1.id,
          },
        },
        player2: {
          connect: {
            id: user2.id,
          },
        },
      },
      include: {
        player1: true,
        player2: true,
      },
    });
    return game;
    // this.server.to(user1.username).emit("servInviteGame", game);
  }

  async matchMaker(dto: Matchmaker): Promise<Game> {
    console.log(`typeof ${typeof dto.userId}`);
    const game = await this.prisma
      .$transaction(async () => {
        const game = await this.prisma.game.findFirst({
          where: {
            player2: { is: null },
            isBlocked: dto.isBlocked as boolean,
            NOT: {
              player1Id: dto.userId as number,
            },
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
              isBlocked: dto.isBlocked,
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
              isBlocked: dto.isBlocked,
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
        if (!game.player2) {
          this.updateInQueue(game.player1Id, true);
        } else if (game.player2) {
          this.updateInQueue(game.player1Id, false);
          this.updateInGame(game.player1Id, true);
          this.updateInGame(game.player2Id, true);
        }
        this.logger.log(game);
        return game;
      })
      .catch(() => {
        // throw error;
        return null;
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
            historic: { is: undefined },
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
    if (!game || !game.id || !_winner || !_looser || !_score) {
      console.log("gameToHistoric : game is null");
      return null;
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
        if (!historic) return null;
        this.updateInGame(historic.winnerID, false);
        this.updateInGame(historic.looserID, false);
        this.logger.log("---------YOOO LE HISTORIC : ", historic);
        return historic;
      })
      .catch((error) => {
        return null;
        throw error;
      });
  }
}
