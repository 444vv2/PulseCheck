import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import Redis from "ioredis";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { PrismaService } from "../prisma/prisma.service";
import { REDIS_CLIENT } from "../redis/redis.module";

@Injectable()
export class SchedulerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqp: AmqpConnection,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Cron("*/30 * * * * *")
  async handleCron() {
    const now = new Date();
    const activeMonitors = await this.prisma.monitor.findMany({
      where: { isActive: true },
    });

    const dueMonitors = activeMonitors.filter((m) => {
      if (!m.lastCheckedAt) return true;
      const elapsedSec = (now.getTime() - m.lastCheckedAt.getTime()) / 1000;
      return elapsedSec >= m.intervalSec;
    });

    for (const monitor of dueMonitors) {
      const lockKey = `monitor:lock:${monitor.id}`;
      const acquired = await this.redis.set(lockKey, "1", "PX", 60000, "NX");
      if (!acquired) continue;

      await this.amqp.publish("pulsecheck", "ping.check", {
        monitorId: monitor.id,
        url: monitor.url,
      });

      await this.prisma.monitor.update({
        where: { id: monitor.id },
        data: { lastCheckedAt: new Date() },
      });

      console.log(`📤 Updated lastCheckedAt for ${monitor.url}`);
    }
  }
}
