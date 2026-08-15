import { NestFactory } from '@nestjs/core';
import { NotifierModule } from './notifier.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(NotifierModule);
  app.enableShutdownHooks();
  console.log('✅ Notifier service started');
}
bootstrap();