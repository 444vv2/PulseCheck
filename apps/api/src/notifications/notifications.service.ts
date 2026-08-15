import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

const TOKEN_TTL_MINUTES = 10;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTelegramLinkToken(userId: string) {
    const token = randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramLinkToken: token,
        telegramLinkTokenExpires: expires,
      },
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    return {
      token,
      expiresAt: expires.toISOString(),
      link: `https://t.me/${botUsername}?start=${token}`,
    };
  }

  async getTelegramLinkStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true },
    });
    return { linked: Boolean(user?.telegramChatId) };
  }

  async unlinkTelegram(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramChatId: null,
        telegramLinkToken: null,
        telegramLinkTokenExpires: null,
      },
    });
  }
}
