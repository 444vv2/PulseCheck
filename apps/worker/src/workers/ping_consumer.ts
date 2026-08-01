import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import axios from 'axios';

interface PingMessage {
	monitorId: string;
	url: string;
}

@Injectable()
export class PingConsumer {
  @RabbitSubscribe({
    exchange: 'pulsecheck',
    routingKey: 'ping.check',
    queue: 'ping_queue',
  })
  async handlePing(msg: PingMessage): Promise<void> {
    const start = Date.now();

    try {
      const response = await axios.get(msg.url, {
        timeout: 10000,
        validateStatus: () => true,
      });
      console.log(
        `✅ ${msg.url} (${msg.monitorId}) → ${response.status} (${Date.now() - start}ms)`,
      );
    } catch (err: any) {
      console.log(
        `❌ ${msg.url} (${msg.monitorId}) → ${err.message} (${Date.now() - start}ms)`,
      );
    }
  }
}