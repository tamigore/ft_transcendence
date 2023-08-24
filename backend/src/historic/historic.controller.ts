import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
} from "@nestjs/common";
import { HistoricService } from "../historic/historic.service";
import { GetCurrentUserId } from "../common/decorators";
import { Historic } from "@prisma/client";

@Controller("historic")
export class HistoricController {
  constructor(private historicService: HistoricService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllHistoric() {
    return this.historicService.getAllHistoric();
  }

  @Get("leaderboard")
  @HttpCode(HttpStatus.OK)
  getLeaderBoard() {
    return this.historicService.getLeaderBoard();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  getPlayerHistoric(@GetCurrentUserId() userId: number) {
    return this.historicService.getGamesByPlayerId(userId);
  }

  @Post("ID")
  @HttpCode(HttpStatus.OK)
  setHistoric(@Body() dto: Historic) {
    return this.historicService.setGameByGameId(dto);
  }
}
