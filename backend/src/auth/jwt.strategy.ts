import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: (req: any) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies["access_token"];
        }
        console.log("hihihiihih:", req.cookies);
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_SECURE_KEY"),
    });
  }

  async validate(payload: any) {
    return await this.userService.findById(payload.sub);
  }
}
