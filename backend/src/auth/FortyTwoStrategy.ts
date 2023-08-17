import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { UserService } from "src/user/user.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.API_UID,
      clientSecret: process.env.API_SECRET,
      callbackURL: String("http://localhost:3000/api/auth/v1/42/callback"),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    console.log("FortyTwoStrategy Validate");
    const fortyTwoUser = {
      email: profile.emails[0].value,
      hash: "",
      hashRt: "",
      username: profile.username,
      id: Number.parseInt(profile.id),
      pictureURL: profile._json.image.link,
    };
    const user = await this.userService.findById(fortyTwoUser.id);
    if (typeof user === "undefined" || !user) {
      return await this.userService.createUser(fortyTwoUser);
    } else {
      console.log("already created in DB!");
    }
    return user;
  }
}
