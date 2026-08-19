import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import * as request from "supertest";
import { AuthModule } from "../src/auth/auth.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const credentials = {
    email: "e2e-test@example.com",
    password: "supersecret123",
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: credentials.email } });
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: credentials.email } });
  });

  describe("POST /auth/register", () => {
    it("registers a new user and sets a refresh cookie", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials)
        .expect(201);

      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.user.email).toBe(credentials.email);
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.headers["set-cookie"][0]).toContain("refreshToken=");
    });

    it("returns 409 when the email is already registered", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials)
        .expect(201);

      await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials)
        .expect(409);
    });

    it("returns 400 for an invalid payload", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "not-an-email" })
        .expect(400);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials)
        .expect(201);
    });

    it("logs in with correct credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(credentials)
        .expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.user.email).toBe(credentials.email);
    });

    it("returns 401 for a wrong password", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: credentials.email, password: "wrong-password" })
        .expect(401);
    });

    it("returns 401 for a non-existent email", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "nobody@example.com", password: "whatever123" })
        .expect(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("issues a new access token using the refresh cookie", async () => {
      const registerResponse = await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials)
        .expect(201);

      const refreshCookie = registerResponse.headers["set-cookie"][0];

      const response = await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Cookie", refreshCookie)
        .expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
    });

    it("returns 401 when no refresh cookie is sent", async () => {
      await request(app.getHttpServer()).post("/auth/refresh").expect(401);
    });
  });
});
