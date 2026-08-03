import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Inject, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "../redis/redis.constant";

@WebSocketGateway({ cors: { origin: "*" } })
export class MonitorsGateway implements OnModuleInit {
  @WebSocketServer() server!: Server;
  private subscriber: Redis | null = null;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleInit() {
    this.subscriber = this.redis.duplicate();
    await this.subscriber.subscribe("monitor:results");

    this.subscriber.on("message", (channel, message) => {
      try {
        const data = JSON.parse(message);
        this.broadcastResult(data.monitorId, data);
        console.log("📡 Get from Redis Pub/Sub:", data);
      } catch (error) {
        console.error("Error parsing Redis message:", error);
      }
    });

    this.subscriber.on("error", (error) => {
      console.error("Redis subscriber error:", error);
    });
  }

  @SubscribeMessage("subscribe:monitor")
  handleSubscribe(
    @MessageBody() monitorId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`monitor:${monitorId}`);
  }

  @SubscribeMessage("unsubscribe:monitor")
  handleUnsubscribe(
    @MessageBody() monitorId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`monitor:${monitorId}`);
  }

  broadcastResult(monitorId: string, data: any) {
    this.server.to(`monitor:${monitorId}`).emit("monitor:update", data);
  }
}
