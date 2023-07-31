import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Param,
} from "@nestjs/common";
import { HistoricService } from "../historic/historic.service";
import { GameService } from "./game.service";
import { Public } from "../common/decorators";
import { Historic, Game } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Matchamker } from "./dto";

@Controller("game")
export class GameController {
  constructor(
    private historicService: HistoricService,
    private gameService: GameService,
    private prismaService: PrismaService,
  ) {}

  @Public()
  @Post("matchmaker")
  @HttpCode(HttpStatus.OK)
  setGameFromId(@Body() dto: Matchamker): Promise<Game> {
    return this.gameService.matchMaker(dto);
  }
}
