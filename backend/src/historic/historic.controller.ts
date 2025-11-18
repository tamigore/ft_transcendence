import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { HistoricService } from "../historic/historic.service";
import { GetCurrentUserId } from "../common/decorators";
import { AtGuard } from "src/common/guards";
import { CreateHistoricDto } from "./dto";

@Controller("historic")
@UseGuards(AtGuard)
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
  getPlayerHistoric(
    @GetCurrentUserId() userId: number,
    @Param("id", ParseIntPipe) targetUserId: number,
  ) {
    if (userId !== targetUserId)
      throw new ForbiddenException("Cannot read another player's history");
    return this.historicService.getGamesByPlayerId(userId);
  }

  @Post("ID")
  @HttpCode(HttpStatus.OK)
  setHistoric(
    @Body() dto: CreateHistoricDto,
    @GetCurrentUserId() userId: number,
  ) {
    if (userId !== dto.winnerId && userId !== dto.looserId)
      throw new ForbiddenException("Cannot report games for other users");
    return this.historicService.setGameByGameId(dto);
  }
}
