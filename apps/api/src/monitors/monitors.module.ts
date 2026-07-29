import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';

@Module({
  imports: [AuthModule],
  controllers: [MonitorsController],
  providers: [MonitorsService],
})
export class MonitorsModule {}

