import { Module } from "@nestjs/common";
import { HistoricService } from "./game.service";
import { GameController } from "./game.controller";

@Module({
  controllers: [GameController],
  providers: [HistoricService],
})
export class GameModule {}