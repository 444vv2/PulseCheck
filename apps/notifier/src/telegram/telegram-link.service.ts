import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import TelegramBot from "node-telegram-bot-api";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TelegramLinkService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramLinkService.name);
  private bot!: TelegramBot;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram-бот not started");
      return;
    }

    this.bot = new TelegramBot(token, {
      polling: {
        params: { timeout: 10 },
        autoStart: false,
      },
    });

    this.bot.on("polling_error", (error) => {
      this.logger.error(`Polling error: ${error.message}`);
    });

    this.bot.on("message", (msg) => {
      this.logger.log(`Incoming message from ${msg.chat.id}: "${msg.text}"`);
    });

    this.registerHandlers();

    await this.bot.deleteWebHook({ drop_pending_updates: true });
    await this.bot.startPolling();

    this.logger.log("✅ Telegram bot started (polling)");
  }

  async onModuleDestroy() {
    if (this.bot) {
      await this.bot.stopPolling();
      this.logger.log("Telegram bot polling stopped");
    }
  }

  private registerHandlers() {
    this.bot.onText(/\/start(?:\s+(\S+))?/, (msg, match) => {
      const chatId = msg.chat.id;
      const linkToken = match?.[1];

      if (!linkToken) {
        this.bot.sendMessage(
          chatId,
          'Go to the PulseCheck dashboard and click "Link Telegram" to get a link.',
        );
        return;
      }

      void this.handleLinkToken(chatId, linkToken);
    });
  }

  private async handleLinkToken(chatId: number, linkToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramLinkToken: linkToken },
    });

    if (!user) {
      await this.bot.sendMessage(
        chatId,
        "❌ This link is invalid. Create a new one on the dashboard.",
      );
      return;
    }

    if (
      !user.telegramLinkTokenExpires ||
      user.telegramLinkTokenExpires < new Date()
    ) {
      await this.bot.sendMessage(
        chatId,
        "⌛ This link has already expired. Create a new one on the dashboard.",
      );
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: String(chatId),
        telegramLinkToken: null,
        telegramLinkTokenExpires: null,
      },
    });

    await this.bot.sendMessage(
      chatId,
      `✅ Done! Account ${user.email} is now linked. Notifications about monitor downtimes will be sent here.`,
    );

    this.logger.log(`Telegram linked for ${user.email} (chatId: ${chatId})`);
  }

  async sendStatusChangeMessage(chatId: string, text: string) {
    if (!this.bot) return;
    await this.bot.sendMessage(chatId, text);
  }
}
