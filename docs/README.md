# PulseCheck

High-throughput SaaS for real-time website and API availability monitoring.
A portfolio project that demonstrates working with queues, background workers, time-series data, and real-time updates.

## Stack

**Frontend:** Next.js, TailwindCSS, React Query, Recharts
**Backend:** NestJS, TypeScript, Prisma
**Databases:** PostgreSQL (users, monitors), MongoDB (ping results)
**Infra:** Redis (locks), RabbitMQ (task queue), Docker Compose
**Auth:** JWT + Refresh Tokens

## Project Status

🚧 Under development. Current phase: **Phase 2 — Auth + Monitors CRUD**

## Development plan

- [x] **Phase 0 — Setup**: monorepo, docker-compose, CI skeleton
- [x] **Phase 1 — Foundation**: NestJS + Prisma + Postgres, health-check
- [x] **Phase 2 — Auth + Monitors CRUD**: JWT, CRUD endpoints, basic UI
- [ ] **Phase 3 — Queue and Worker**: scheduler, Redis-lock, RabbitMQ, ping worker, Mongo write
- [ ] **Phase 4 — Realtime dashboard**: WebSocket, live updates, graphs
- [ ] **Phase 5 — Notifications**: email when monitor status changes
- [ ] **Phase 6 — Tests, deployment**: unit/e2e tests, CI/CD, production deployment

Detailed architecture: [`ARHITECTURE.MD`](ARHITECTURE.MD)
API contract: [`api_contract.yaml`](api_contract.yaml)
