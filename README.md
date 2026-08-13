
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
│  │  │  │  ├─ 20260812115341_add_notifications
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
│  │  │  │  ├─ monitors.service.ts
│  │  │  │  └─ schemas
│  │  │  │     └─ ping_result.schema.ts
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
│  ├─ notifier
│  │  ├─ nest-cli.json
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ email
│  │  │  │  └─ email.service.ts
│  │  │  ├─ main.ts
│  │  │  ├─ notifier.module.ts
│  │  │  ├─ prisma
│  │  │  │  └─ prisma.service.ts
│  │  │  └─ status-changed.consumer.ts
│  │  └─ tsconfig.json
│  ├─ web
│  │  ├─ app
│  │  │  ├─ activity
│  │  │  │  └─ page.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ page.module.css
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ login
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ register
│  │  │     └─ page.tsx
│  │  ├─ components
│  │  │  ├─ activity
│  │  │  │  ├─ ActivityControls.module.css
│  │  │  │  ├─ ActivityControls.tsx
│  │  │  │  ├─ ActivityHeader.module.css
│  │  │  │  ├─ ActivityHeader.tsx
│  │  │  │  ├─ ActivityStats.module.css
│  │  │  │  ├─ ActivityStats.tsx
│  │  │  │  ├─ ResponseTimeChart.module.css
│  │  │  │  └─ ResponseTimeChart.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ AuthForm.module.css
│  │  │  │  ├─ AuthForm.tsx
│  │  │  │  ├─ AuthIntro.module.css
│  │  │  │  └─ AuthIntro.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ AddMonitorForm.module.css
│  │  │  │  ├─ AddMonitorForm.tsx
│  │  │  │  ├─ MonitorList.module.css
│  │  │  │  ├─ MonitorList.tsx
│  │  │  │  ├─ MonitorRow.tsx
│  │  │  │  ├─ MonitorSection.module.css
│  │  │  │  ├─ MonitorSection.tsx
│  │  │  │  ├─ StatsGrid.module.css
│  │  │  │  └─ StatsGrid.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ DashboardShell.module.css
│  │  │  │  ├─ DashboardShell.tsx
│  │  │  │  ├─ Sidebar.module.css
│  │  │  │  └─ Sidebar.tsx
│  │  │  └─ ui
│  │  │     ├─ Brand.module.css
│  │  │     ├─ Brand.tsx
│  │  │     ├─ Button.module.css
│  │  │     ├─ Button.tsx
│  │  │     ├─ Eyebrow.module.css
│  │  │     ├─ Eyebrow.tsx
│  │  │     ├─ InlineEditableText.module.css
│  │  │     ├─ InlineEditableText.tsx
│  │  │     ├─ PasswordInput.module.css
│  │  │     ├─ PasswordInput.tsx
│  │  │     ├─ StatusDot.module.css
│  │  │     └─ StatusDot.tsx
│  │  ├─ hooks
│  │  │  ├─ useApiRequest.ts
│  │  │  ├─ useAuthSession.ts
│  │  │  ├─ useMonitorResults.ts
│  │  │  └─ useMonitors.ts
│  │  ├─ lib
│  │  │  ├─ authStorage.ts
│  │  │  └─ socket.ts
│  │  ├─ next-env.d.ts
│  │  ├─ next.config.ts
│  │  ├─ package.json
│  │  ├─ styles
│  │  │  └─ globals.css
│  │  └─ tsconfig.json
│  └─ worker
│     ├─ nest-cli.json
│     ├─ package.json
│     ├─ src
│     │  └─ workers
│     │     ├─ main.ts
│     │     ├─ ping_consumer.ts
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