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
import { Matchmaker, Spectate } from "./game.interfaces";

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
  setGameFromId(@Body() dto: Matchmaker): Promise<Game> {
    return this.gameService.matchMaker(dto);
  }

  @Public()
  @Post("spectate")
  setGameSpectator(@Body() dto: Spectate): Promise<Game> {
    return this.gameService.SpectateGame(dto);
  }
}
