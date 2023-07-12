import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
} from "@nestjs/common";
import { HistoricService } from "./game.service";
import { Public } from "../common/decorators";
import { GameHistoric } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Controller("historic")
export class GameController {
  constructor(private historicService: HistoricService, private prismaService : PrismaService) {}

  @Public()
  @Get("ID")
  @HttpCode(HttpStatus.OK)
  getGameFromId(@Body() dto: GameHistoric) {
    console.log(dto);
    return this.historicService.getGameByGameId(dto);
  }
  
  @Public()
  @Post("ID")
  @HttpCode(HttpStatus.OK)
  setGameFromId(@Body() dto: GameHistoric) {
      console.log(dto);
      return this.historicService.setGameByGameId(dto);
  }

  @Public()
  @Get("Games")
  @HttpCode(HttpStatus.OK)
  getGamesHistoric(@Body() dto: GameHistoric): Promise<GameHistoric[]> {
    return this.historicService.getGamesByPlayerId(dto);
  }
}

