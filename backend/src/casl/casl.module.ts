import { Module } from "@nestjs/common";
import { CaslAbilityFactory } from "./casl.ability";

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
