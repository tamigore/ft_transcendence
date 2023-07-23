import {
  ForbiddenException,
  Injectable,
  HttpException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/binary";
import * as argon2 from "argon2/argon2";
import { PrismaService } from "../prisma/prisma.service";
import { SignUpDto, SignInDto } from "./dto";
import { JwtPayload, Tokens } from "./types";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signupLocal(dto: SignUpDto): Promise<Tokens> {
    this.logger.debug(
      `email : ${dto.email}`,
      `username : ${dto.username}`,
      `password : ${dto.password}`,
    );
    const newhash = await argon2.hash(dto.password);

    const user = await this.prisma.user
      .create({
        data: {
          email: dto.email,
          username: dto.username,
          hash: newhash,
        },
      })
      .catch((error: any) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new HttpException("Credentials incorrect", 400);
          }
        }
        throw new HttpException("Access Denied", 403);
      });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    await this.updateLog(user.id, true);
    return tokens;
  }

  async signinLocal(dto: SignInDto): Promise<Tokens> {
    this.logger.log("signinLocal");
    this.logger.debug(
      "user email : ",
      dto.email,
      "user password : ",
      dto.password,
    );
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new HttpException("Access Denied", 404);
    if (user.loggedIn) throw new HttpException("Access Denied", 423);
    const verif = await argon2.verify(user.hash, dto.password);
    if (!verif) throw new HttpException("Access Denied", 403);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    await this.updateLog(user.id, true);
    return tokens;
  }

  async logout(userId: number): Promise<boolean> {
    this.logger.log("logout");
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashRt: {
          not: null,
        },
      },
      data: {
        hashRt: null,
        loggedIn: false,
      },
    });
    return true;
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    this.logger.log("refreshTokens");
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashRt) throw new ForbiddenException("Access Denied");

    const rtMatches = await argon2.verify(user.hashRt, rt);
    if (!rtMatches) throw new ForbiddenException("Access Denied");

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    this.logger.log("updateRtHash");
    const hash = await argon2.hash(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashRt: hash,
      },
    });
  }

  async updateLog(userId: number, logged: boolean): Promise<void> {
    this.logger.log("updateLog");
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        loggedIn: logged,
      },
    });
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    this.logger.log("getTokens");
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>("AT_SECRET"),
        expiresIn: "7d",
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>("RT_SECRET"),
        expiresIn: "7d",
      }),
    ]);

    return {
      userId: userId,
      access_token: at,
      refresh_token: rt,
    };
  }
}
