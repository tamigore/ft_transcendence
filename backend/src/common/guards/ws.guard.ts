import { CanActivate, Injectable, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import jwt from "jsonwebtoken";

@Injectable()
export class WsGuard
  extends PassportStrategy(Strategy, "jwt")
  implements CanActivate
{
  private logger = new Logger("WsGuard");
  constructor(private userService: UserService, private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>("AT_SECRET"),
    });
  }

  canActivate(
    context: any
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(
        bearerToken,
        this.config.get<string>("AT_SECRET")
      ) as any;
      return new Promise((resolve, reject) => {
        return this.userService
          .findByUsername(decoded.username)
          .then((user) => {
            if (user) {
              resolve(user);
            } else {
              reject(false);
            }
          });
      });
    } catch (ex) {
      this.logger.log(ex);
      return false;
    }
  }
}
