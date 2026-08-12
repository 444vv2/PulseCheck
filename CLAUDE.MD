# PulseCheck — Working Guide

## Project purpose

PulseCheck is a SaaS for real-time URL/API availability monitoring. It is a
monorepo with a Next.js dashboard, NestJS API, standalone NestJS worker, and
shared TypeScript types.

## Architecture boundaries

- `apps/api` owns HTTP API, authentication, monitors CRUD, scheduling, and the
  WebSocket gateway.
- `apps/worker` consumes ping jobs and writes time-series check results.
- PostgreSQL (through Prisma) stores users and monitors.
- MongoDB stores `ping_results`; Redis is for locks/cache; RabbitMQ transports
  ping and notification jobs.
- A worker must publish completed results via Redis Pub/Sub so the API can emit
  `monitor:update` to WebSocket clients. Do not couple the worker directly to
  API WebSocket connections.

## API contract

The source of truth is `docs/api_contract.yaml`. Preserve its routes, request
and response shapes, authentication schemes, and monitor ownership rules when
implementing later phases.

## Delivery phases

- Phase 1: NestJS API, Prisma, PostgreSQL, and `GET /health` only.
- Phase 2: JWT/refresh authentication and monitors CRUD.
- Phase 3+: queue, worker, MongoDB history, realtime, notifications, tests,
  and deployment as described in `docs/README.md`.

Do not introduce Phase 2+ behaviour into the Phase 1 foundation unless a task
explicitly asks for it.

## Conventions

- Use TypeScript with NestJS modules and dependency injection.
- Access PostgreSQL only through the shared `PrismaService`.
- Keep environment-specific values in `.env`, never in source control.
- Use UUIDs and timestamps consistent with the documented Prisma schema.

always look at ARCHITECTURE.md before a new module