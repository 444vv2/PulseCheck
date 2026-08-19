import { NotFoundException } from "@nestjs/common";
import { MonitorsService } from "./monitors.service";
import { PrismaService } from "../prisma/prisma.service";
import { Model } from "mongoose";
import { PingResult } from "./schemas/ping_result.schema";

describe("MonitorsService", () => {
  let service: MonitorsService;
  let prisma: {
    $transaction: jest.Mock;
    monitor: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let pingResultModel: {
    find: jest.Mock;
  };

  const ownerId = "user-1";
  const monitorId = "monitor-1";

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
      monitor: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    pingResultModel = {
      find: jest.fn(),
    };

    service = new MonitorsService(
      prisma as unknown as PrismaService,
      pingResultModel as unknown as Model<PingResult>,
    );
  });

  describe("findAll", () => {
    it("scopes the query to the owner and applies pagination", async () => {
      prisma.$transaction.mockResolvedValue([[{ id: monitorId }], 1]);

      const result = await service.findAll(ownerId, { page: 2, limit: 10 });

      expect(prisma.monitor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId },
          skip: 10,
          take: 10,
        }),
      );
      expect(prisma.monitor.count).toHaveBeenCalledWith({
        where: { ownerId },
      });
      expect(result).toEqual({ items: [{ id: monitorId }], total: 1 });
    });
  });

  describe("create", () => {
    it("creates a monitor with the owner attached", async () => {
      prisma.monitor.create.mockResolvedValue({ id: monitorId, ownerId });

      await service.create(ownerId, { url: "https://example.com" } as any);

      expect(prisma.monitor.create).toHaveBeenCalledWith({
        data: { url: "https://example.com", ownerId },
      });
    });
  });

  describe("findOne", () => {
    it("returns the monitor when it belongs to the owner", async () => {
      prisma.monitor.findFirst.mockResolvedValue({ id: monitorId, ownerId });

      const result = await service.findOne(ownerId, monitorId);

      expect(prisma.monitor.findFirst).toHaveBeenCalledWith({
        where: { id: monitorId, ownerId },
      });
      expect(result).toEqual({ id: monitorId, ownerId });
    });

    it("throws NotFoundException when the monitor does not belong to the owner", async () => {
      prisma.monitor.findFirst.mockResolvedValue(null);

      await expect(service.findOne(ownerId, monitorId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("throws NotFoundException without updating when the monitor is not the owner's", async () => {
      prisma.monitor.findFirst.mockResolvedValue(null);

      await expect(
        service.update(ownerId, monitorId, { url: "https://new.com" } as any),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.monitor.update).not.toHaveBeenCalled();
    });

    it("updates the monitor when it belongs to the owner", async () => {
      prisma.monitor.findFirst.mockResolvedValue({ id: monitorId, ownerId });
      prisma.monitor.update.mockResolvedValue({
        id: monitorId,
        url: "https://new.com",
      });

      const result = await service.update(ownerId, monitorId, {
        url: "https://new.com",
      } as any);

      expect(prisma.monitor.update).toHaveBeenCalledWith({
        where: { id: monitorId },
        data: { url: "https://new.com" },
      });
      expect(result).toEqual({ id: monitorId, url: "https://new.com" });
    });
  });

  describe("remove", () => {
    it("throws NotFoundException without deleting when the monitor is not the owner's", async () => {
      prisma.monitor.findFirst.mockResolvedValue(null);

      await expect(service.remove(ownerId, monitorId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.monitor.delete).not.toHaveBeenCalled();
    });

    it("deletes the monitor when it belongs to the owner", async () => {
      prisma.monitor.findFirst.mockResolvedValue({ id: monitorId, ownerId });
      prisma.monitor.delete.mockResolvedValue(undefined);

      await service.remove(ownerId, monitorId);

      expect(prisma.monitor.delete).toHaveBeenCalledWith({
        where: { id: monitorId },
      });
    });
  });

  describe("getPingResults", () => {
    const mockQueryChain = () => {
      const lean = jest.fn().mockResolvedValue([{ isUp: true }]);
      const limit = jest.fn().mockReturnValue({ lean });
      const sort = jest.fn().mockReturnValue({ limit });
      pingResultModel.find.mockReturnValue({ sort });
      return { sort, limit, lean };
    };

    it("throws NotFoundException when the monitor is not the owner's", async () => {
      prisma.monitor.findFirst.mockResolvedValue(null);

      await expect(service.getPingResults(ownerId, monitorId)).rejects.toThrow(
        NotFoundException,
      );

      expect(pingResultModel.find).not.toHaveBeenCalled();
    });

    it("queries without a date filter when from/to are not provided", async () => {
      prisma.monitor.findFirst.mockResolvedValue({ id: monitorId, ownerId });
      mockQueryChain();

      await service.getPingResults(ownerId, monitorId);

      expect(pingResultModel.find).toHaveBeenCalledWith({ monitorId });
    });

    it("builds a checkedAt range when from and to are provided", async () => {
      prisma.monitor.findFirst.mockResolvedValue({ id: monitorId, ownerId });
      mockQueryChain();

      await service.getPingResults(
        ownerId,
        monitorId,
        "2026-08-01T00:00:00.000Z",
        "2026-08-16T00:00:00.000Z",
      );

      expect(pingResultModel.find).toHaveBeenCalledWith({
        monitorId,
        checkedAt: {
          $gte: new Date("2026-08-01T00:00:00.000Z"),
          $lte: new Date("2026-08-16T00:00:00.000Z"),
        },
      });
    });
  });
});
