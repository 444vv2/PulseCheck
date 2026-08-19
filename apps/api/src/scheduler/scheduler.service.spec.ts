import { SchedulerService } from "./scheduler.service";
import { PrismaService } from "../prisma/prisma.service";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import Redis from "ioredis";

describe("SchedulerService", () => {
  let service: SchedulerService;
  let prisma: {
    monitor: { findMany: jest.Mock; update: jest.Mock };
  };
  let amqp: { publish: jest.Mock };
  let redis: { set: jest.Mock };

  const now = new Date("2026-08-16T12:00:00.000Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    prisma = {
      monitor: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    amqp = { publish: jest.fn() };
    redis = { set: jest.fn() };

    service = new SchedulerService(
      prisma as unknown as PrismaService,
      amqp as unknown as AmqpConnection,
      redis as unknown as Redis,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("checks a monitor that has never been checked before", async () => {
    prisma.monitor.findMany.mockResolvedValue([
      {
        id: "monitor-1",
        url: "https://example.com",
        lastCheckedAt: null,
        intervalSec: 60,
      },
    ]);
    redis.set.mockResolvedValue("OK");
    prisma.monitor.update.mockResolvedValue(undefined);

    await service.handleCron();

    expect(amqp.publish).toHaveBeenCalledWith("pulsecheck", "ping.check", {
      monitorId: "monitor-1",
      url: "https://example.com",
    });
  });

  it("skips a monitor whose interval has not elapsed yet", async () => {
    prisma.monitor.findMany.mockResolvedValue([
      {
        id: "monitor-1",
        url: "https://example.com",
        lastCheckedAt: new Date("2026-08-16T11:59:50.000Z"), // 10s ago
        intervalSec: 60,
      },
    ]);

    await service.handleCron();

    expect(redis.set).not.toHaveBeenCalled();
    expect(amqp.publish).not.toHaveBeenCalled();
  });

  it("checks a monitor whose interval has elapsed", async () => {
    prisma.monitor.findMany.mockResolvedValue([
      {
        id: "monitor-1",
        url: "https://example.com",
        lastCheckedAt: new Date("2026-08-16T11:59:00.000Z"), // 60s ago
        intervalSec: 60,
      },
    ]);
    redis.set.mockResolvedValue("OK");
    prisma.monitor.update.mockResolvedValue(undefined);

    await service.handleCron();

    expect(amqp.publish).toHaveBeenCalled();
  });

  it("skips a due monitor when the lock could not be acquired", async () => {
    prisma.monitor.findMany.mockResolvedValue([
      {
        id: "monitor-1",
        url: "https://example.com",
        lastCheckedAt: null,
        intervalSec: 60,
      },
    ]);
    redis.set.mockResolvedValue(null); // NX lock not acquired

    await service.handleCron();

    expect(amqp.publish).not.toHaveBeenCalled();
    expect(prisma.monitor.update).not.toHaveBeenCalled();
  });

  it("updates lastCheckedAt after publishing", async () => {
    prisma.monitor.findMany.mockResolvedValue([
      {
        id: "monitor-1",
        url: "https://example.com",
        lastCheckedAt: null,
        intervalSec: 60,
      },
    ]);
    redis.set.mockResolvedValue("OK");
    prisma.monitor.update.mockResolvedValue(undefined);

    await service.handleCron();

    expect(prisma.monitor.update).toHaveBeenCalledWith({
      where: { id: "monitor-1" },
      data: { lastCheckedAt: now },
    });
  });

  it("only checks active monitors (queried via the where clause)", async () => {
    prisma.monitor.findMany.mockResolvedValue([]);

    await service.handleCron();

    expect(prisma.monitor.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
    });
  });
});