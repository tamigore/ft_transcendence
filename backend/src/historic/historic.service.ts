import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Historic } from "@prisma/client";
import { CreateHistoricDto } from "./dto";

@Injectable()
export class HistoricService {
  private logger: Logger = new Logger("HistoricService");
  constructor(private prisma: PrismaService) {}

  async getGamesByPlayerId(userId: number): Promise<Historic[]> {
    return await this.prisma.historic
      .findMany({
        where: {
          OR: [
            {
              winnerID: userId,
            },
            {
              looserID: userId,
            },
          ],
        },
        orderBy: {
          created_at: "desc",
        },
        include: {
          winner: true,
          looser: true,
        },
      })
      .then((res) => res)
      .catch((err) => {
        throw new Error(err);
      });
  }

  async getLeaderBoard() {
    return await this.prisma.user
      .findMany({
        take: 10,
        orderBy: {
          win: {
            _count: "desc",
          },
        },
        include: {
          win: true,
          loose: true,
        },
      })
      .then((res) => res)
      .catch((err) => {
        throw new Error(err);
      });
  }

  async getAllHistoric(): Promise<Historic[]> {
    return await this.prisma.historic.findMany({});
  }

  async setGameByGameId(dto: CreateHistoricDto): Promise<void> {
    await this.prisma.historic
      .create({
        data: {
          winner: {
            connect: {
              id: dto.winnerId,
            },
          },
          looser: {
            connect: {
              id: dto.looserId,
            },
          },
          score: dto.score,
          game: {
            connect: {
              id: dto.gameId,
            },
          },
        },
      })
      .catch((error: any) => {
        this.logger.log("", error);
      });
  }
}
