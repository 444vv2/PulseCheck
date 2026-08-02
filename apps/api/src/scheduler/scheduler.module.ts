import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { RabbitMqModule } from '../rabbitMQ/rabbitmq.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot(), RabbitMqModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}