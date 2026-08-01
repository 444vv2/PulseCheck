import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export interface PingJob {
	monitorId: string;
	url: string;
}

@Injectable()
export class RabbitMqService {
	constructor(private readonly amqpConnection: AmqpConnection) {}

	async sendPing(job: PingJob): Promise<void> {
		await this.amqpConnection.publish('pulsecheck', 'ping.check', job);
	}
}