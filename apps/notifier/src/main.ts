import { NestFactory } from '@nestjs/core';
import { NotifierModule } from './notifier.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(NotifierModule);
  console.log('✅ Notifier service started');
}
bootstrap();