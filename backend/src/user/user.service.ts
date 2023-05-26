import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
// import { User } from "@prisma/client";
// import * as argon from "argon2";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  // async modifyUser(dto: User) {
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       email: dto.email,
  //     },
  //   });

  //   if (!user) throw new ForbiddenException("Access Denied");

  //   const passwordMatches = await argon.verify(user.hash, dto.password);
  //   if (!passwordMatches) throw new ForbiddenException("Access Denied");
  // }

  // async getUser(dto: User): Promise<User> {}
}
