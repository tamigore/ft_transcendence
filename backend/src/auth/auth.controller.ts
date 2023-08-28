import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Header,
  Get,
  Req,
  Res,
  Ip,
} from "@nestjs/common";
import { Public, GetCurrentUserId, GetCurrentUser } from "../common/decorators";
import { RtGuard } from "../common/guards";
import { AuthService } from "./auth.service";
import { SignUpDto, SignInDto } from "./dto";
import { Tokens } from "./types";
import { FortyTwoAuthGuard } from "./FortyTwoGuard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Header("Access-Control-Allow-Origin", "*")
  @Post("local/signup")
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: SignUpDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Header("Access-Control-Allow-Origin", "*")
  @Post("local/signin")
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: SignInDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @Public()
  // @Header("Access-Control-Allow-Origin", "*")
  @Get("login42")
  @UseGuards(FortyTwoAuthGuard)
  async login42() {
    // console.log("login42 ??");
  }

  @Public()
  @Get("v1/42/callback")
  @UseGuards(FortyTwoAuthGuard)
  async callback(
    @Req() req: any,
    @Res() res: any,
    @Ip() ip: ParameterDecorator,
  ) {
    console.log("callback ?? ip: " + ip);
    console.log();
    const token = await this.authService.login(req.user);
    if (!token) {
      console.log("NOTOKEN");
      res.redirect('http://' + req.headers.host.split(":")[0] + `:8080`);
    } else {
      res
        .cookie("userId", token.userId)
        .cookie("access_token", token.access_token)
        .cookie("refresh_token", token.refresh_token)
        .redirect('http://' + req.headers.host.split(":")[0] + `:8080`);
    }
    return token;
  }

  @Post("logout")
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser("refreshToken") refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
