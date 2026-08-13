import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { StatusChangedConsumer } from "./status-changed.consumer";
import { PrismaService } from "./prisma/prisma.service";
import { EmailService } from "./email/email.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        exchanges: [{ name: "pulsecheck", type: "topic" }],
        uri:
          config.get<string>("RABBITMQ_URI") ??
          "amqp://pulsecheck:pulsecheck@localhost:5672",
        connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
      }),
    }),
  ],
  providers: [StatusChangedConsumer, PrismaService, EmailService],
})
export class NotifierModule {}
