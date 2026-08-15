import { Injectable } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { PrismaService } from "./prisma/prisma.service";
import { EmailService } from "./email/email.service";
import { TelegramLinkService } from "./telegram/telegram-link.service";
import { formatDateTime } from "./utils/format-date";

type StatusChangedEvent = {
  monitorId: string;
  ownerId: string;
  url: string;
  previousStatus: boolean;
  currentStatus: boolean;
  checkedAt: string;
};

@Injectable()
export class StatusChangedConsumer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly telegram: TelegramLinkService,
  ) {}

  @RabbitSubscribe({
    exchange: "pulsecheck",
    routingKey: "monitor.status_changed",
    queue: "notifications_queue",
  })
  async handleStatusChanged(event: StatusChangedEvent) {
    const owner = await this.prisma.user.findUnique({
      where: { id: event.ownerId },
    });
    if (!owner) return;

    const direction = event.currentStatus ? "UP" : "DOWN";
    const formattedTime = formatDateTime(event.checkedAt, owner.timezone);
    const message = `${event.url} is now ${direction} (checked ${formattedTime})`;

    try {
      await this.email.sendStatusChangeEmail(
        owner.email,
        event.url,
        event.currentStatus,
        event.checkedAt,
      );
      await this.logNotification(event, "EMAIL", "SENT", message);
      console.log(`📧 Email sent to ${owner.email}: ${message}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await this.logNotification(
        event,
        "EMAIL",
        "FAILED",
        message,
        errorMessage,
      );
      console.error(`❌ Failed to email ${owner.email}:`, errorMessage);
    }

    if (owner.telegramChatId) {
      const icon = event.currentStatus ? "✅" : "🔴";
      const telegramText = `${icon} ${message}`;
      try {
        await this.telegram.sendStatusChangeMessage(
          owner.telegramChatId,
          telegramText,
        );
        await this.logNotification(event, "TELEGRAM", "SENT", message);
        console.log(`📲 Telegram sent to ${owner.telegramChatId}: ${message}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        await this.logNotification(
          event,
          "TELEGRAM",
          "FAILED",
          message,
          errorMessage,
        );
        console.error(
          `❌ Failed to send Telegram to ${owner.telegramChatId}:`,
          errorMessage,
        );
      }
    }
  }

  private async logNotification(
    event: StatusChangedEvent,
    channel: "EMAIL" | "TELEGRAM",
    status: "SENT" | "FAILED",
    message: string,
    error?: string,
  ) {
    await this.prisma.notification.create({
      data: {
        monitorId: event.monitorId,
        ownerId: event.ownerId,
        channel,
        status,
        message,
        error,
      },
    });
  }
}
