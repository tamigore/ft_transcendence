import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AtStrategy, RtStrategy } from "./strategies";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { FortyTwoStrategy } from "./FortyTwoStrategy";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
    FortyTwoStrategy,
    UserService,
  ],
})
export class AuthModule {}
