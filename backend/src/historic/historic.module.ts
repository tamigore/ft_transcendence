import { Module } from "@nestjs/common";
import { HistoricController } from "./historic.controller";
import { HistoricService } from "./historic.service";
import { UserService } from "src/user/user.service";

@Module({
  controllers: [HistoricController],
  providers: [HistoricService, UserService],
})
export class GameModule {}
