import { CanActivate, Injectable, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class WsGuard
  extends PassportStrategy(Strategy, "jwt")
  implements CanActivate
{
  private logger = new Logger("WsGuard");
  constructor(
    private userService: UserService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("AT_SECRET"),
    });
  }

  validate(req: Request) {
    return req.headers;
  }

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken = context.args[0].handshake.auth.token.split(" ")[1];
    this.logger.debug("canActivate bearerToken: " + bearerToken);
    try {
      const decoded = this.jwtService.verify(bearerToken, {
        secret: this.config.get<string>("AT_SECRET"),
      });
      this.logger.debug("canActivate decoded: " + decoded);
      return new Promise((resolve, reject) => {
        return this.userService.findById(decoded.id).then((user) => {
          if (user) {
            resolve(user);
          } else {
            reject(false);
          }
        });
      });
    } catch (ex) {
      this.logger.error(ex);
      return false;
    }
  }
}
