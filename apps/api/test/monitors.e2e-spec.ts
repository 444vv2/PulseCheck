import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import * as cookieParser from "cookie-parser";
import * as request from "supertest";
import { AuthModule } from "../src/auth/auth.module";
import { MonitorsModule } from "../src/monitors/monitors.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { PingResult } from "../src/monitors/schemas/ping_result.schema";
import { REDIS_CLIENT } from "../src/redis/redis.constant";
import { RedisModule } from "../src/redis/redis.module";

describe("Monitors (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pingResultModel: { find: jest.Mock };
  const redisMock = {
    publish: jest.fn(),
    set: jest.fn(),
    duplicate: jest.fn().mockReturnValue({
      subscribe: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    }),
  };

  const ownerCredentials = {
    email: "monitors-owner@example.com",
    password: "supersecret123",
  };
  const otherCredentials = {
    email: "monitors-other@example.com",
    password: "supersecret123",
  };

  let ownerToken: string;
  let otherToken: string;

  const cleanupUsers = async () => {
    await prisma.monitor.deleteMany({
      where: {
        owner: {
          email: { in: [ownerCredentials.email, otherCredentials.email] },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: [ownerCredentials.email, otherCredentials.email] },
      },
    });
  };

  beforeAll(async () => {
    pingResultModel = { find: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        MonitorsModule,
        RedisModule,
      ],
    })
      .overrideProvider(getModelToken(PingResult.name))
      .useValue(pingResultModel)
      .overrideProvider(REDIS_CLIENT)
      .useValue(redisMock)
      .compile();

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
    await cleanupUsers();

    const ownerRes = await request(app.getHttpServer())
      .post("/auth/register")
      .send(ownerCredentials);
    ownerToken = ownerRes.body.accessToken;

    const otherRes = await request(app.getHttpServer())
      .post("/auth/register")
      .send(otherCredentials);
    otherToken = otherRes.body.accessToken;
  });

  afterAll(async () => {
    await cleanupUsers();
    await app.close();
  });

  afterEach(async () => {
    await prisma.monitor.deleteMany({
      where: { owner: { email: ownerCredentials.email } },
    });
  });

  describe("POST /monitors", () => {
    it("returns 401 without a token", async () => {
      await request(app.getHttpServer())
        .post("/monitors")
        .send({ url: "https://example.com", intervalSec: 60 })
        .expect(401);
    });

    it("creates a monitor for the authenticated user", async () => {
      const response = await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 })
        .expect(201);

      expect(response.body.url).toBe("https://example.com");
      expect(response.body.intervalSec).toBe(60);
    });

    it("returns 400 when intervalSec is below the minimum", async () => {
      await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 10 })
        .expect(400);
    });

    it("returns 400 for an invalid url", async () => {
      await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "not-a-url", intervalSec: 60 })
        .expect(400);
    });
  });

  describe("GET /monitors and /monitors/:id", () => {
    it("only lists monitors belonging to the authenticated user", async () => {
      await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get("/monitors")
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });

    it("returns 404 when fetching another user's monitor by id", async () => {
      const created = await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 });

      await request(app.getHttpServer())
        .get(`/monitors/${created.body.id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(404);
    });
  });

  describe("PATCH /monitors/:id", () => {
    it("returns 404 when updating another user's monitor", async () => {
      const created = await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 });

      await request(app.getHttpServer())
        .patch(`/monitors/${created.body.id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ isActive: false })
        .expect(404);
    });

    it("updates a monitor the user owns", async () => {
      const created = await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 });

      const response = await request(app.getHttpServer())
        .patch(`/monitors/${created.body.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });
  });

  describe("DELETE /monitors/:id", () => {
    it("returns 404 when deleting another user's monitor", async () => {
      const created = await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 });

      await request(app.getHttpServer())
        .delete(`/monitors/${created.body.id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(404);
    });

    it("deletes a monitor the user owns", async () => {
      const created = await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 });

      await request(app.getHttpServer())
        .delete(`/monitors/${created.body.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/monitors/${created.body.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .expect(404);
    });
  });

  describe("GET /monitors/:id/ping-results", () => {
    it("returns 404 for another user's monitor", async () => {
      const created = await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 });

      await request(app.getHttpServer())
        .get(`/monitors/${created.body.id}/ping-results`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(404);
    });

    it("returns ping results from the mocked model for the owner", async () => {
      const created = await request(app.getHttpServer())
        .post("/monitors")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ url: "https://example.com", intervalSec: 60 });

      const lean = jest.fn().mockResolvedValue([{ isUp: true }]);
      const limit = jest.fn().mockReturnValue({ lean });
      const sort = jest.fn().mockReturnValue({ limit });
      pingResultModel.find.mockReturnValue({ sort });

      const response = await request(app.getHttpServer())
        .get(`/monitors/${created.body.id}/ping-results`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toEqual([{ isUp: true }]);
    });
  });
});
