PulseCheck — Architecture
1. Overview

PulseCheck — SaaS for monitoring URL/API availability. User creates a "monitor" (URL + check interval), the system pings it regularly and shows the status/uptime in real time.

2. Services and their responsibilities
Service Technology Responsibility
web Next.js UI: login, list of monitors, dashboard, graphs
api NestJS Auth, CRUD of monitors, scheduler, WebSocket Gateway
worker Node.js (NestJS standalone app) Listens to the queue, pings the URL, writes the result to Mongo
postgres PostgreSQL 16 Relational data: users, monitors
mongodb MongoDB 7 Time-series data: ping results
redis Redis 7 Distributed locks (SET NX PX, one instance — without Redlock), session cache
rabbitmq RabbitMQ 3 Queues ping_queue, notification_queue
notifier Node.js (NestJS standalone app) Consumer notification_queue: notifications to Telegram (Bot API)
3. Data flow
1. Cron (api, every 60s)
→ finds monitors where now >= lastCheckedAt + interval
→ SET NX EX lock in Redis on monitor:lock:{id}
→ if lock is set successfully → publish {id} in RabbitMQ "ping_queue"

2. Worker
→ consume from "ping_queue"
→ HTTP GET/HEAD on monitor.url with 10s timeout
→ writes result to MongoDB (ping_results collection)
→ if status changed (up→down or down→up) → publish to "notification_queue"
→ releases Redis lock

3. API (WebSocket Gateway)
→ Worker and API are separate processes, so Worker cannot directly push data
to WebSocket connections held by API. Bridge between them: Redis Pub/Sub channel
`monitor:results` — Worker publishes there after each write to Mongo.
→ API subscribed to `monitor:results`, when a new message is received, it sends an event
`monitor:update` to those clients subscribed to this monitorId

4. Notifier (separate process, consumer "notification_queue")
→ fires only when the status changes (up→down or down→up), not on every ping
→ email: AWS SES/SMTP
→ Telegram: POST https://api.telegram.org/bot{TOKEN}/sendMessage
with the chat_id that the user has linked to the account (see p.4 below)
4. Database schema
PostgreSQL (Prisma)
prisma
model User {
id String @id @default(uuid())
email String @unique
passwordHash String
telegramChatId String? // filled after /start in bot, null not yet bound
createdAt DateTime @default(now())
monitors Monitor[]
}

model Monitor {
id String @id @default(uuid())
url String
intervalSec Int @default(300) // 5 min by default
isActive Boolean @default(true)
lastCheckedAt DateTime?
ownerId String
owner User @relation(fields: [ownerId], references: [id])
createdAt DateTime @default(now())
}
MongoDB (ping_results collection)
json
{
"_id": "ObjectId",
"monitorId": "uuid-monitor from Postgres",
"statusCode": 200,
"isUp": true,
"responseTimeMs": 142,
"checkedAt": "2026-07-28T10:15:00Z",
"error": null
}

Index: { monitorId: 1, checkedAt: -1 } — for quick selection of history of a specific monitor.

5. Redis — keys
Key Purpose TTL
monitor:lock:{id} Lock to avoid duplicate checks 60s
session:refresh:{userId} Refresh token storage (optional) 7 days
6. RabbitMQ — queues
Queue Producer Consumer Payload
ping_queue api (scheduler) worker { "monitorId": "uuid" }
notification_queue worker notifier { "monitorId": "uuid", "status": "down", "url": "...", "userId": "uuid" }
7. Telegram bot — account binding

The bot cannot "find" the user itself — the binding is initiated by the user:

In Settings on the frontend, the user clicks "Connect Telegram" → API generates a one-time token (linkToken, TTL 10 min, stored in Redis: telegram:link:{token} → userId) and shows the link https://t.me/PulseCheckBot?start={linkToken}.
User clicks on link → Telegram opens bot and sends /start {linkToken}.
Notifier (also handles Telegram webhook) reads linkToken from Redis, finds userId, stores chat_id from update in User.telegramChatId, deletes token from Redis.
Then notifier sends all notifications for this user to saved chat_id.