import {
  Controller,
  Response,
  Body,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GetCurrentUserId } from "../common/decorators";
import { TfaService } from "./twoFA.service";
import { AtGuard } from "src/common/guards";

@Controller("tfa")
export class TfaController {
  constructor(private tfaService: TfaService) {}

  @Get("off")
  async turnOff(@GetCurrentUserId() id: number): Promise<string> {
    return this.tfaService.deactivate(id);
  }

  @Get("on")
  @UseGuards(AtGuard)
  async turnOn(
    @GetCurrentUserId() id: number,
    @Response() res: any,
  ): Promise<any> {
    const secret: string = await this.tfaService.generateTfaSecret(id);
    if (typeof secret === undefined || !secret.length) return null;
    return this.tfaService.displayQrCode(secret, id, res);
  }

  @Post("activation")
  @UseGuards(AtGuard)
  async confirmActivation(
    @GetCurrentUserId() id: number,
    @Body() body: { secret: string },
  ): Promise<boolean> {
    return this.tfaService.confirmActivation(id, body.secret);
  }

  @Post("authenticate")
  @UseGuards(AtGuard)
  async authenticateApi(
    @GetCurrentUserId() id: number,
    @Body() body: { tfa_code: string },
  ): Promise<any> {
    return this.tfaService.authenticateApi(id, body.tfa_code);
  }
}
