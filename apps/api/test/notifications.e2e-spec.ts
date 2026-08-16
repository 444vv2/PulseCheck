import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import * as request from "supertest";
import { AuthModule } from "../src/auth/auth.module";
import { NotificationsModule } from "../src/notifications/notifications.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Notifications (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const credentials = {
    email: "notifications-owner@example.com",
    password: "supersecret123",
  };

  let accessToken: string;

  beforeAll(async () => {
    process.env.TELEGRAM_BOT_USERNAME = "PulseCheckBot";

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        NotificationsModule,
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
    await prisma.user.deleteMany({ where: { email: credentials.email } });

    const registerRes = await request(app.getHttpServer())
      .post("/auth/register")
      .send(credentials);
    accessToken = registerRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: credentials.email } });
    await app.close();
  });

  describe("POST /notifications/telegram/link-token", () => {
    it("returns 401 without a token", async () => {
      await request(app.getHttpServer())
        .post("/notifications/telegram/link-token")
        .expect(401);
    });

    it("returns a link token and stores it on the user", async () => {
      const response = await request(app.getHttpServer())
        .post("/notifications/telegram/link-token")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.link).toBe(
        `https://t.me/PulseCheckBot?start=${response.body.token}`,
      );

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });
      expect(user?.telegramLinkToken).toBe(response.body.token);
    });
  });

  describe("GET /notifications/telegram/status", () => {
    it("returns linked: false before linking", async () => {
      const response = await request(app.getHttpServer())
        .get("/notifications/telegram/status")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({ linked: false });
    });

    it("returns linked: true once a telegramChatId is set", async () => {
      await prisma.user.update({
        where: { email: credentials.email },
        data: { telegramChatId: "123456" },
      });

      const response = await request(app.getHttpServer())
        .get("/notifications/telegram/status")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({ linked: true });
    });
  });

  describe("DELETE /notifications/telegram/link", () => {
    it("clears the telegram link", async () => {
      await request(app.getHttpServer())
        .delete("/notifications/telegram/link")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });
      expect(user?.telegramChatId).toBeNull();

      const statusResponse = await request(app.getHttpServer())
        .get("/notifications/telegram/status")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(statusResponse.body).toEqual({ linked: false });
    });
  });
});
