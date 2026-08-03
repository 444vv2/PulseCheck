import { Module, Global } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constant";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useValue: new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      }),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
