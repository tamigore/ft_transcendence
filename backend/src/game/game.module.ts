import { Module } from "@nestjs/common";
import { GameController } from "./game.controller";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";

@Module({
  controllers: [GameController],
  providers: [GameGateway, GameService],
})
export class GameModule {}


// import { Module } from "@nestjs/common";
// import { HistoricService } from "./game.service";
// import { GameController } from "./game.controller";

// @Module({
//   controllers: [GameController],
//   providers: [HistoricService],
// })
// export class GameModule {}