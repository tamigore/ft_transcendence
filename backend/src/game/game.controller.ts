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
  @HttpCode(HttpStatus.OK)
  setGameSpectator(@Body() dto: Spectate): Promise<Game> {
    return this.gameService.SpectateGame(dto);
  }

  @UseGuards(AtGuard)
  @Post("inviteGame")
  @HttpCode(HttpStatus.OK)
  setPrivateGame(
    @Body() dto: { user1username: string; user2username: string },
  ) {
    this.gameService.inviteGame(dto);
  }
}
