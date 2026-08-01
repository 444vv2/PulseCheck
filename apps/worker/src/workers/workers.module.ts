import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { HelloWorldConsumer } from './hello-world-consumer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        exchanges: [{ name: 'pulsecheck', type: 'topic' }],
        uri:
          config.get<string>('RABBITMQ_URI') ??
          'amqp://pulsecheck:pulsecheck@localhost:5672',
        connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
      }),
    }),
  ],
  providers: [HelloWorldConsumer],
})
export class WorkerModule {}
