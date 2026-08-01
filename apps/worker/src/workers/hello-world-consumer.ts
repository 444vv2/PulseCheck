import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class HelloWorldConsumer {
  @RabbitSubscribe({
    exchange: 'pulsecheck',
    routingKey: 'test.hello',
    queue: 'hello_world_queue',
  })
  handleHelloWorld(msg: any): void {
    console.log('📩 Message received:', msg);
  }
}