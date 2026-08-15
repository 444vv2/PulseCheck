import { Module, Global } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constant";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useValue: new Redis(process.env.REDIS_URL!),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
