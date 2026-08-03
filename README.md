
```
PulseCheck
├─ apps
│  ├─ api
│  │  ├─ nest-cli.json
│  │  ├─ package.json
│  │  ├─ prisma
│  │  │  ├─ migrations
│  │  │  │  ├─ 20260727120000_init
│  │  │  │  │  └─ migration.sql
│  │  │  │  └─ migration_lock.toml
│  │  │  └─ schema.prisma
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ auth
│  │  │  │  ├─ auth.controller.ts
│  │  │  │  ├─ auth.module.ts
│  │  │  │  ├─ auth.service.ts
│  │  │  │  ├─ current-user.decorator.ts
│  │  │  │  ├─ dto
│  │  │  │  │  └─ auth-credentials.dto.ts
│  │  │  │  ├─ jwt-auth.guard.ts
│  │  │  │  └─ jwt.strategy.ts
│  │  │  ├─ health
│  │  │  │  ├─ health.controller.ts
│  │  │  │  ├─ health.module.ts
│  │  │  │  └─ health.service.ts
│  │  │  ├─ main.ts
│  │  │  ├─ monitors
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ create-monitor.dto.ts
│  │  │  │  │  ├─ list-monitors-query.dto.ts
│  │  │  │  │  └─ update-monitor.dto.ts
│  │  │  │  ├─ monitors.controller.ts
│  │  │  │  ├─ monitors.module.ts
│  │  │  │  └─ monitors.service.ts
│  │  │  ├─ prisma
│  │  │  │  ├─ prisma.module.ts
│  │  │  │  └─ prisma.service.ts
│  │  │  └─ rabbitMQ
│  │  │     ├─ rabbitmq.controller.ts
│  │  │     ├─ rabbitmq.module.ts
│  │  │     └─ rabbitmq.service.ts
│  │  ├─ tsconfig.build.json
│  │  └─ tsconfig.json
│  ├─ web
│  │  ├─ app
│  │  │  ├─ (auth)
│  │  │  │  ├─ auth-form.tsx
│  │  │  │  ├─ login
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ register
│  │  │  │     └─ page.tsx
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ globals.css
│  │  │  ├─ layout.tsx
│  │  │  └─ page.tsx
│  │  ├─ next-env.d.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ worker
├─ CLAUDE.MD
├─ docker-compose.yml
├─ docs
│  ├─ api_contract.yaml
│  ├─ ARСHITECTURE.MD
│  └─ README.md
├─ package-lock.json
└─ package.json

```
```
PulseCheck
├─ apps
│  ├─ api
│  │  ├─ nest-cli.json
│  │  ├─ package.json
│  │  ├─ prisma
│  │  │  ├─ migrations
│  │  │  │  ├─ 20260727120000_init
│  │  │  │  │  └─ migration.sql
│  │  │  │  └─ migration_lock.toml
│  │  │  └─ schema.prisma
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ auth
│  │  │  │  ├─ auth.controller.ts
│  │  │  │  ├─ auth.module.ts
│  │  │  │  ├─ auth.service.ts
│  │  │  │  ├─ current-user.decorator.ts
│  │  │  │  ├─ dto
│  │  │  │  │  └─ auth-credentials.dto.ts
│  │  │  │  ├─ jwt-auth.guard.ts
│  │  │  │  └─ jwt.strategy.ts
│  │  │  ├─ health
│  │  │  │  ├─ health.controller.ts
│  │  │  │  ├─ health.module.ts
│  │  │  │  └─ health.service.ts
│  │  │  ├─ main.ts
│  │  │  ├─ monitors
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ create-monitor.dto.ts
│  │  │  │  │  ├─ list-monitors-query.dto.ts
│  │  │  │  │  └─ update-monitor.dto.ts
│  │  │  │  ├─ monitors.controller.ts
│  │  │  │  ├─ monitors.gateway.ts
│  │  │  │  ├─ monitors.module.ts
│  │  │  │  └─ monitors.service.ts
│  │  │  ├─ prisma
│  │  │  │  ├─ prisma.module.ts
│  │  │  │  └─ prisma.service.ts
│  │  │  ├─ rabbitMQ
│  │  │  │  ├─ rabbitmq.module.ts
│  │  │  │  └─ rabbitmq.service.ts
│  │  │  ├─ redis
│  │  │  │  ├─ redis.constant.ts
│  │  │  │  ├─ redis.module.ts
│  │  │  │  └─ redis.service.ts
│  │  │  └─ scheduler
│  │  │     ├─ scheduler.module.ts
│  │  │     └─ scheduler.service.ts
│  │  ├─ tsconfig.build.json
│  │  └─ tsconfig.json
│  ├─ web
│  │  ├─ app
│  │  │  ├─ (auth)
│  │  │  │  ├─ auth-form.tsx
│  │  │  │  ├─ login
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ register
│  │  │  │     └─ page.tsx
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ globals.css
│  │  │  ├─ layout.tsx
│  │  │  └─ page.tsx
│  │  ├─ next-env.d.ts
│  │  ├─ next.config.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ worker
│     ├─ nest-cli.json
│     ├─ package.json
│     ├─ src
│     │  └─ workers
│     │     ├─ main.ts
│     │     ├─ ping_consumer.ts
│     │     ├─ schemas
│     │     │  └─ ping_result.schema.ts
│     │     └─ workers.module.ts
│     └─ tsconfig.json
├─ CLAUDE.MD
├─ docker-compose.yml
├─ docs
│  ├─ api_contract.yaml
│  ├─ ARСHITECTURE.MD
│  └─ README.md
├─ package-lock.json
├─ package.json
└─ README.md

```