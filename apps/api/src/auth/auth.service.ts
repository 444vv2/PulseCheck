import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";

type PublicUser = Pick<User, "id" | "email">;

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = TokenPair & { user: PublicUser };

type RefreshPayload = { sub: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(credentials: AuthCredentialsDto): Promise<AuthResult> {
    try {
      const passwordHash = await bcrypt.hash(credentials.password, 12);
      const user = await this.prisma.user.create({
        data: { email: credentials.email, passwordHash },
        select: { id: true, email: true },
      });
      return { user, ...(await this.createTokenPair(user)) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email already registered");
      }
      throw error;
    }
  }

  async login(credentials: AuthCredentialsDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email },
      select: { id: true, email: true, passwordHash: true },
    });

    if (
      !user ||
      !(await bcrypt.compare(credentials.password, user.passwordHash))
    ) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const publicUser = { id: user.id, email: user.email };
    return { user: publicUser, ...(await this.createTokenPair(publicUser)) };
  }

  async refresh(refreshToken: string | undefined): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required");
    }

    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true },
      });

      if (!user) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return { user, ...(await this.createTokenPair(user)) };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async createTokenPair(user: PublicUser): Promise<TokenPair> {
    const payload = { sub: user.id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: "7d",
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
