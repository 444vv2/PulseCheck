import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMqService {
	constructor(private readonly amqpConnection: AmqpConnection) {}

	async sendHelloWorld(): Promise<void> {
		await this.amqpConnection.publish('pulsecheck', 'test.hello', {
			message: 'hello world',
			createdAt: new Date().toISOString(),
		});
	}
}