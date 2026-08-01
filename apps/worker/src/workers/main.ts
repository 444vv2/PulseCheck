import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './workers.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(WorkerModule);
  console.log('🐰 Worker is listening for messages...');
}
bootstrap();