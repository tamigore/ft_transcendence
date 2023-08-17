import { Module, forwardRef } from "@nestjs/common";
import { TfaService } from "./twoFA.service";
import { TfaController } from "./twoFA.controller";

import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { AuthService } from "src/auth/auth.service";

@Module({
  imports: [
    UserModule,
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "30d" },
    }),
  ],
  providers: [TfaService, UserService, AuthService],
  controllers: [TfaController],
  exports: [TfaService],
})
export class TwoFAModule {}
