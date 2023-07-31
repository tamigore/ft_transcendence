import { Module } from "@nestjs/common";
import { HistoricService } from "../historic/historic.service";
import { GameController } from "./game.controller";
import { GameGateway } from "./game.gateway"
import { GameService } from "./game.service"
import { UserService } from "src/user/user.service";

@Module({
  controllers: [GameController],
  providers: [HistoricService, GameGateway, GameService, UserService],
})
export class GameModule {}