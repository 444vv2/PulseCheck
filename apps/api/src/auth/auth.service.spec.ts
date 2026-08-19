jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from "bcryptjs";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: { 
    user: { 
        create: jest.Mock; 
        findUnique: jest.Mock 
    }};
  let jwt: { 
    signAsync: jest.Mock; 
    verifyAsync: jest.Mock 
  };
  let config: { 
    getOrThrow: jest.Mock 
  };

  const credentials = { email: "test@example.com", password: "secret123" };

  beforeEach(() => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    jwt = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    config = {
      getOrThrow: jest.fn().mockReturnValue("refresh-secret"),
    };

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );

    jest.clearAllMocks();
    config.getOrThrow.mockReturnValue("refresh-secret");
    jwt.signAsync.mockResolvedValue("some-token");
  });

  describe("register", () => {
    it("creates a user and returns tokens", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      prisma.user.create.mockResolvedValue({
        id: "user-1",
        email: credentials.email,
      });

      const result = await service.register(credentials);

      expect(bcrypt.hash).toHaveBeenCalledWith(credentials.password, 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: credentials.email, passwordHash: "hashed-password" },
        select: { id: true, email: true },
      });
      expect(result.user).toEqual({ id: "user-1", email: credentials.email });
      expect(result.accessToken).toBe("some-token");
      expect(result.refreshToken).toBe("some-token");
    });

    it("throws ConflictException when email is already taken", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: "6.0.0",
        }),
      );

      await expect(service.register(credentials)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("login", () => {
    it("returns tokens when credentials are correct", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: credentials.email,
        passwordHash: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(credentials);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        credentials.password,
        "hashed-password",
      );
      expect(result.user).toEqual({ id: "user-1", email: credentials.email });
    });

    it("throws UnauthorizedException when user does not exist", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("throws UnauthorizedException when password is wrong", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: credentials.email,
        passwordHash: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("refresh", () => {
    it("throws UnauthorizedException when no token is provided", async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("returns new tokens for a valid refresh token", async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: "user-1" });
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: credentials.email,
      });

      const result = await service.refresh("valid-refresh-token");

      expect(jwt.verifyAsync).toHaveBeenCalledWith("valid-refresh-token", {
        secret: "refresh-secret",
      });
      expect(result.user).toEqual({ id: "user-1", email: credentials.email });
    });

    it("throws UnauthorizedException for an invalid refresh token", async () => {
      jwt.verifyAsync.mockRejectedValue(new Error("jwt malformed"));

      await expect(service.refresh("bad-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
