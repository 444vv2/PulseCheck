import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { MonitorsModule } from './monitors/monitors.module';
import { RabbitMqModule } from './rabbitMQ/rabbitmq.module';
import { PrismaModule } from './prisma/prisma.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SchedulerModule,
    RabbitMqModule,
    AuthModule,
    HealthModule,
    MonitorsModule,
    RedisModule,
  ],
})
export class AppModule {}
