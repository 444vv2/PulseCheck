import { Injectable, OnModuleInit } from "@nestjs/common";
import { AmqpConnection, RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import mongoose from "mongoose";
import axios from "axios";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PingConsumer implements OnModuleInit {
  private readonly pingResultModel = mongoose.model(
    "PingResult",
    new mongoose.Schema({
      monitorId: { type: String, required: true, index: true },
      statusCode: { type: Number, default: null },
      isUp: { type: Boolean, required: true },
      responseTimeMs: { type: Number, required: true },
      error: { type: String, default: null },
      checkedAt: { type: Date, required: true, index: true },
    }),
  );
  private readonly Redis = new Redis(process.env.REDIS_URL!);

  private readonly prisma = new PrismaClient();
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    try {
      await mongoose.connect(process.env.MONGO_URL!);
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
    }
  }

  @RabbitSubscribe({
    exchange: "pulsecheck",
    routingKey: "ping.check",
    queue: "ping_queue",
  })
  async handlePing(msg: { monitorId: string; url: string }) {
    const start = Date.now();
    let result;

    try {
      const res = await axios.get(msg.url, {
        timeout: 10000,
        validateStatus: () => true,
      });
      result = {
        statusCode: res.status,
        isUp: res.status >= 200 && res.status < 400,
        responseTimeMs: Date.now() - start,
        error: null,
      };
    } catch (err: any) {
      result = {
        statusCode: null,
        isUp: false,
        responseTimeMs: Date.now() - start,
        error: err.message,
      };
    }

    await this.pingResultModel.create({
      monitorId: msg.monitorId,
      ...result,
      checkedAt: new Date(),
    });

    console.log(
      `✅ ${msg.url} (${msg.monitorId}) → ${result.statusCode ?? "ERR"} (${result.responseTimeMs}ms) [saved to Mongo]`,
    );

    await this.Redis.publish(
      "monitor:results",
      JSON.stringify({
        monitorId: msg.monitorId,
        ...result,
        checkedAt: new Date().toISOString(),
      }),
    );

    await this.detectStatusChangeAndNotify(msg.monitorId, msg.url, result.isUp);
  }

  private async detectStatusChangeAndNotify(
    monitorId: string,
    url: string,
    currentIsUp: boolean,
  ) {
    const monitor = await this.prisma.monitor.findUnique({
      where: { id: monitorId },
      select: { lastIsUp: true, ownerId: true },
    });

    if (!monitor) return;

    const previousIsUp = monitor.lastIsUp;

    if (previousIsUp !== currentIsUp) {
      await this.prisma.monitor.update({
        where: { id: monitorId },
        data: { lastIsUp: currentIsUp },
      });
    }

    if (previousIsUp === null || previousIsUp === currentIsUp) return;

    await this.amqpConnection.publish("pulsecheck", "monitor.status_changed", {
      monitorId,
      ownerId: monitor.ownerId,
      url,
      previousStatus: previousIsUp,
      currentStatus: currentIsUp,
      checkedAt: new Date().toISOString(),
    });

    console.log(
      `🔔 Change status ${url} (${monitorId}): ${previousIsUp ? "UP" : "DOWN"} → ${
        currentIsUp ? "UP" : "DOWN"
      } — notification sent`,
    );
  }
}
