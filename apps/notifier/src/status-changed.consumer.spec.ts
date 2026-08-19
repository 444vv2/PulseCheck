import { StatusChangedConsumer } from "./status-changed.consumer";
import { PrismaService } from "./prisma/prisma.service";
import { EmailService } from "./email/email.service";
import { TelegramLinkService } from "./telegram/telegram-link.service";

describe("StatusChangedConsumer", () => {
  let consumer: StatusChangedConsumer;
  let prisma: {
    user: { findUnique: jest.Mock };
    notification: { create: jest.Mock };
  };
  let email: { sendStatusChangeEmail: jest.Mock };
  let telegram: { sendStatusChangeMessage: jest.Mock };

  const baseEvent = {
    monitorId: "monitor-1",
    ownerId: "user-1",
    url: "https://example.com",
    previousStatus: true,
    currentStatus: false,
    checkedAt: "2026-08-16T10:00:00.000Z",
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      notification: { create: jest.fn() },
    };
    email = { sendStatusChangeEmail: jest.fn() };
    telegram = { sendStatusChangeMessage: jest.fn() };

    consumer = new StatusChangedConsumer(
      prisma as unknown as PrismaService,
      email as unknown as EmailService,
      telegram as unknown as TelegramLinkService,
    );
  });

  it("does nothing if the owner is not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await consumer.handleStatusChanged(baseEvent);

    expect(email.sendStatusChangeEmail).not.toHaveBeenCalled();
    expect(telegram.sendStatusChangeMessage).not.toHaveBeenCalled();
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });

  it("sends an email and logs SENT when email succeeds", async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: "owner@example.com",
      timezone: "Europe/Kyiv",
      telegramChatId: null,
    });
    email.sendStatusChangeEmail.mockResolvedValue(undefined);

    await consumer.handleStatusChanged(baseEvent);

    expect(email.sendStatusChangeEmail).toHaveBeenCalledWith(
      "owner@example.com",
      baseEvent.url,
      baseEvent.currentStatus,
      baseEvent.checkedAt,
    );
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ channel: "EMAIL", status: "SENT" }),
      }),
    );
  });

  it("logs FAILED when email sending throws", async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: "owner@example.com",
      timezone: "Europe/Kyiv",
      telegramChatId: null,
    });
    email.sendStatusChangeEmail.mockRejectedValue(new Error("Resend down"));

    await consumer.handleStatusChanged(baseEvent);

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          channel: "EMAIL",
          status: "FAILED",
          error: "Resend down",
        }),
      }),
    );
  });

  it("does not attempt telegram when owner has no telegramChatId", async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: "owner@example.com",
      timezone: "Europe/Kyiv",
      telegramChatId: null,
    });
    email.sendStatusChangeEmail.mockResolvedValue(undefined);

    await consumer.handleStatusChanged(baseEvent);

    expect(telegram.sendStatusChangeMessage).not.toHaveBeenCalled();
  });

  it("sends a telegram message when owner has telegramChatId", async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: "owner@example.com",
      timezone: "Europe/Kyiv",
      telegramChatId: "123456",
    });
    email.sendStatusChangeEmail.mockResolvedValue(undefined);
    telegram.sendStatusChangeMessage.mockResolvedValue(undefined);

    await consumer.handleStatusChanged(baseEvent);

    expect(telegram.sendStatusChangeMessage).toHaveBeenCalledWith(
      "123456",
      expect.stringContaining("is now DOWN"),
    );
  });
});
