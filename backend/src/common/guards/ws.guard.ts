import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import { JwtPayload } from "src/auth/types";
import { UserService } from "src/user/user.service";

@Injectable()
export class WsGuard implements CanActivate {
  private logger = new Logger("WsGuard");

  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      this.logger.warn(`WS connection rejected (missing token) for socket ${client.id}`);
      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.get<string>("AT_SECRET"),
      });
      const user = await this.userService.findById(payload.sub);

      if (!user) {
        this.logger.warn(`WS connection rejected (user not found) for socket ${client.id}`);
        return false;
      }

      client.data.user = user;
      return true;
    } catch (error) {
      this.logger.error(`WS token verification failed for socket ${client.id}`, error as Error);
      return false;
    }
  }

  private extractToken(client: Socket): string | null {
    const candidates = [
      client.handshake.auth?.token,
      client.handshake.headers?.authorization,
      this.normalizeQueryToken(client.handshake.query?.token),
    ];

    for (const raw of candidates) {
      const normalized = this.normalizeToken(raw);
      if (normalized) return normalized;
    }
    return null;
  }

  private normalizeToken(raw?: string | string[]): string | null {
    if (!raw) return null;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.toLowerCase().startsWith("bearer ")) {
      return trimmed.slice(7).trim();
    }
    return trimmed;
  }

  private normalizeQueryToken(token?: string | string[]): string | undefined {
    if (!token) return undefined;
    return Array.isArray(token) ? token[0] : token;
  }
}
