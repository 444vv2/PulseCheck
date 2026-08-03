// apps/worker/src/ping.consumer.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import mongoose from "mongoose";
import axios from "axios";
import Redis from "ioredis";

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
  private readonly Redis = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
  });

  async onModuleInit() {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI ?? "mongodb://localhost:27017/pulsecheck",
      );
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
  }
}
