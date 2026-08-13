import { Injectable } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { PrismaService } from "./prisma/prisma.service";
import { EmailService } from "./email/email.service";

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
  ) {}

  @RabbitSubscribe({
    exchange: "pulsecheck",
    routingKey: "notification.status_changed",
    queue: "notifications_queue",
  })
  async handleStatusChanged(event: StatusChangedEvent) {
    const owner = await this.prisma.user.findUnique({
      where: { id: event.ownerId },
    });

    if (!owner) return;

    const direction = event.currentStatus ? "UP" : "DOWN";
    const message = `${event.url} is now ${direction} (checked ${event.checkedAt})`;

    try {
      await this.email.sendStatusChangeEmail(
        owner.email,
        event.url,
        event.currentStatus,
        event.checkedAt,
      );
      await this.logNotification(event, "SENT", message);
      console.log(`📧 Email sent to ${owner.email}: ${message}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await this.logNotification(event, "FAILED", message, errorMessage);
      console.error(`❌ Failed to email ${owner.email}:`, errorMessage);
    }
  }

  private async logNotification(
    event: StatusChangedEvent,
    status: "SENT" | "FAILED",
    message: string,
    error?: string,
  ) {
    await this.prisma.notification.create({
      data: {
        monitorId: event.monitorId,
        ownerId: event.ownerId,
        channel: "EMAIL",
        status,
        message,
        error,
      },
    });
  }
}
