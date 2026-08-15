import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MonitorsController } from "./monitors.controller";
import { MonitorsService } from "./monitors.service";
import { MonitorsGateway } from "./monitors.gateway";
import { MongooseModule } from "@nestjs/mongoose";
import { PingResult, PingResultSchema } from "./schemas/ping_result.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: PingResult.name, schema: PingResultSchema },
    ]),
  ],
  controllers: [MonitorsController],
  providers: [MonitorsService, MonitorsGateway],
  exports: [MonitorsGateway],
})
export class MonitorsModule {}
