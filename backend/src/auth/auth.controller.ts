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
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  @Post("local/signup")
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: SignUpDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  @Post("local/signin")
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: SignInDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @Public()
  // @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  @Get("login42")
  @UseGuards(FortyTwoAuthGuard)
  async login42() {
    console.log("login42 ??");
  }

  @Public()
  @Get("v1/42/callback")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  @UseGuards(FortyTwoAuthGuard)
  async callback(@Req() req: any, @Res() res: any) {
    console.log("callback ??");
    const token = await this.authService.login(req.user);
    res
      .cookie("access_token", token.access_token, { httpOnly: true })
      .redirect("http://localhost:8080/");
    return token;
  }

  @Post("logout")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser("refreshToken") refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
