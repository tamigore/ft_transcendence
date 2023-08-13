import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
} from "@nestjs/common";
import { HistoricService } from "../historic/historic.service";
import { Public } from "../common/decorators";
import { Historic } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Controller("historic")
export class HistoricController {
  constructor(
    private historicService: HistoricService,
    private prismaService: PrismaService,
  ) {}

  @Public()
  @Get("ID")
  @HttpCode(HttpStatus.OK)
  getGameFromId(@Body() dto: Historic) {
    return this.historicService.getGameByGameId(dto);
  }

  @Public()
  @Post("ID")
  @HttpCode(HttpStatus.OK)
  setGameFromId(@Body() dto: Historic) {
    // return this.historicService.setGameByGameId(dto);
  }

  @Public()
  @Get("Games")
  @HttpCode(HttpStatus.OK)
  getGamesHistoric(@Body() dto: Historic): Promise<Historic[]> {
    return this.historicService.getGamesByPlayerId(dto);
  }
}
