jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    model: jest.fn().mockReturnValue({ create: jest.fn() }),
    connect: jest.fn(),
    Schema: jest.fn(),
  },
}));

jest.mock("ioredis", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    publish: jest.fn(),
  })),
}));

jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      monitor: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    })),
  };
});

import { PingConsumer } from "./ping_consumer";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";

describe("PingConsumer.detectStatusChangeAndNotify", () => {
  let consumer: PingConsumer;
  let amqpConnection: { publish: jest.Mock };
  let prismaMock: {
    monitor: { findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(() => {
    amqpConnection = { publish: jest.fn() };
    consumer = new PingConsumer(amqpConnection as unknown as AmqpConnection);
    prismaMock = (consumer as any).prisma;
  });

  it("does nothing if the monitor is not found", async () => {
    prismaMock.monitor.findUnique.mockResolvedValue(null);

    await (consumer as any).detectStatusChangeAndNotify(
      "monitor-1",
      "https://example.com",
      false,
    );

    expect(amqpConnection.publish).not.toHaveBeenCalled();
  });

  it("updates lastIsUp but does not notify on the first check (previousIsUp is null)", async () => {
    prismaMock.monitor.findUnique.mockResolvedValue({
      lastIsUp: null,
      ownerId: "user-1",
    });

    await (consumer as any).detectStatusChangeAndNotify(
      "monitor-1",
      "https://example.com",
      false,
    );

    expect(prismaMock.monitor.update).toHaveBeenCalledWith({
      where: { id: "monitor-1" },
      data: { lastIsUp: false },
    });
    expect(amqpConnection.publish).not.toHaveBeenCalled();
  });

  it("does not notify when the status has not changed", async () => {
    prismaMock.monitor.findUnique.mockResolvedValue({
      lastIsUp: true,
      ownerId: "user-1",
    });

    await (consumer as any).detectStatusChangeAndNotify(
      "monitor-1",
      "https://example.com",
      true,
    );

    expect(prismaMock.monitor.update).not.toHaveBeenCalled();
    expect(amqpConnection.publish).not.toHaveBeenCalled();
  });

  it("updates status and publishes an event when the status changes", async () => {
    prismaMock.monitor.findUnique.mockResolvedValue({
      lastIsUp: true,
      ownerId: "user-1",
    });

    await (consumer as any).detectStatusChangeAndNotify(
      "monitor-1",
      "https://example.com",
      false,
    );

    expect(prismaMock.monitor.update).toHaveBeenCalledWith({
      where: { id: "monitor-1" },
      data: { lastIsUp: false },
    });
    expect(amqpConnection.publish).toHaveBeenCalledWith(
      "pulsecheck",
      "monitor.status_changed",
      expect.objectContaining({
        monitorId: "monitor-1",
        ownerId: "user-1",
        previousStatus: true,
        currentStatus: false,
      }),
    );
  });
});
