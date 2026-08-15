import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  RabbitMQConfig,
  RabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): RabbitMQConfig => {
        return {
          uri:
            configService.get<string>('RABBITMQ_URI')!,
          exchanges: [
            {
              name: 'pulsecheck',
              type: 'topic',
            },
          ],
          connectionInitOptions: {
            wait: true,
            reject: true,
            timeout: 3000,
          },
          defaultPublishOptions: {
            persistent: true,
          },
        };
      },
    }),
  ],
  providers: [RabbitMqService],
  exports: [RabbitMQModule],
})
export class RabbitMqModule {}