import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { StatusChangedConsumer } from "./status-changed.consumer";
import { PrismaModule } from "./prisma/prisma.module";
import { EmailService } from "./email/email.service";
import { TelegramLinkService } from "./telegram/telegram-link.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        exchanges: [{ name: "pulsecheck", type: "topic" }],
        uri:
          config.get<string>("RABBITMQ_URI")!,
        connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
      }),
    }),
  ],
  providers: [StatusChangedConsumer, EmailService, TelegramLinkService],
})
export class NotifierModule {}
