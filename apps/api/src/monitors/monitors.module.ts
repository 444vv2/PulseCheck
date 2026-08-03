import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';
import { MonitorsGateway } from './monitors.gateway';

@Module({
  imports: [AuthModule],
  controllers: [MonitorsController],
  providers: [MonitorsService, MonitorsGateway],
  exports: [MonitorsGateway],
})
export class MonitorsModule {}

