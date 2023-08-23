import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
} from "@nestjs/common";
import { GameService } from "./game.service";
import { GetCurrentUserId } from "../common/decorators";
import { Game } from "@prisma/client";
import { Matchmaker, Spectate } from "./game.interfaces";
import { UseGuards } from "@nestjs/common";
import { AtGuard } from "src/common/guards";

@Controller("game")
export class GameController {
  constructor(private gameService: GameService) {}

  @Get("spectate")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async findPublicRooms() {
    return await this.gameService.findSpectate();
  }

  @UseGuards(AtGuard)
  @Post("matchmaker")
  @HttpCode(HttpStatus.OK)
  setGameFromId(
    @GetCurrentUserId() userId,
    @Body() dto: Matchmaker,
  ): Promise<Game> {
    dto.userId = userId;
    return this.gameService.matchMaker(dto);
  }

  @UseGuards(AtGuard)
  @Post("spectate")
  setGameSpectator(@Body() dto: Spectate): Promise<Game> {
    return this.gameService.SpectateGame(dto);
  }
}

// import {
//   Body,
//   Controller,
//   HttpCode,
//   HttpStatus,
//   Post,
//   Get,
// } from "@nestjs/common";
// import { GameService } from "./game.service";
// import { Public } from "../common/decorators";
// import { Historic } from "@prisma/client";

// @Controller("historic")
// export class GameController {
//   constructor(private historicService: HistoricService) {}

//   @Public()
//   @Get("ID")
//   @HttpCode(HttpStatus.OK)
//   getGameFromId(@Body() dto: Historic) {
//     return this.historicService.getGameByGameId(dto);
//   }

//   @Public()
//   @Post("ID")
//   @HttpCode(HttpStatus.OK)
//   setGameFromId(@Body() dto: Historic) {
//     return this.historicService.setGameByGameId(dto);
//   }

//   @Public()
//   @Get("Games")
//   @HttpCode(HttpStatus.OK)
//   getGamesHistoric(@Body() dto: Historic): Promise<Historic[]> {
//     return this.historicService.getGamesByPlayerId(dto);
//   }
// }
