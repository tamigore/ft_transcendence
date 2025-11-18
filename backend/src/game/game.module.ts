import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { GameController } from "./game.controller";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { UserService } from "src/user/user.service";
import { WsGuard } from "src/common/guards";

@Module({
  controllers: [GameController],
  providers: [GameGateway, GameService, UserService, JwtService, WsGuard],
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