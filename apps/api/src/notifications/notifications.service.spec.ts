import { NotificationsService } from "./notifications.service";
import { PrismaService } from "../prisma/prisma.service";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let prisma: {
    user: { update: jest.Mock; findUnique: jest.Mock };
  };

  const userId = "user-1";

  beforeEach(() => {
    prisma = {
      user: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    service = new NotificationsService(prisma as unknown as PrismaService);
    process.env.TELEGRAM_BOT_USERNAME = "PulseCheckBot";
  });

  describe("createTelegramLinkToken", () => {
    it("saves a token and expiry on the user and returns a link", async () => {
      prisma.user.update.mockResolvedValue(undefined);

      const result = await service.createTelegramLinkToken(userId);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          telegramLinkToken: expect.any(String),
          telegramLinkTokenExpires: expect.any(Date),
        },
      });
      expect(result.token).toHaveLength(48); // randomBytes(24).toString("hex")
      expect(result.link).toBe(
        `https://t.me/PulseCheckBot?start=${result.token}`,
      );
    });

    it("sets an expiry roughly 10 minutes in the future", async () => {
      prisma.user.update.mockResolvedValue(undefined);
      const before = Date.now();

      const result = await service.createTelegramLinkToken(userId);

      const expiresAt = new Date(result.expiresAt).getTime();
      expect(expiresAt).toBeGreaterThan(before + 9 * 60_000);
      expect(expiresAt).toBeLessThanOrEqual(before + 10 * 60_000 + 1000);
    });
  });

  describe("getTelegramLinkStatus", () => {
    it("returns linked: true when telegramChatId is set", async () => {
      prisma.user.findUnique.mockResolvedValue({ telegramChatId: "12345" });

      const result = await service.getTelegramLinkStatus(userId);

      expect(result).toEqual({ linked: true });
    });

    it("returns linked: false when telegramChatId is null", async () => {
      prisma.user.findUnique.mockResolvedValue({ telegramChatId: null });

      const result = await service.getTelegramLinkStatus(userId);

      expect(result).toEqual({ linked: false });
    });

    it("returns linked: false when the user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getTelegramLinkStatus(userId);

      expect(result).toEqual({ linked: false });
    });
  });

  describe("unlinkTelegram", () => {
    it("clears telegram fields on the user", async () => {
      prisma.user.update.mockResolvedValue(undefined);

      await service.unlinkTelegram(userId);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          telegramChatId: null,
          telegramLinkToken: null,
          telegramLinkTokenExpires: null,
        },
      });
    });
  });
});
