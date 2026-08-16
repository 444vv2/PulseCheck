FROM node:20-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/notifier/package.json apps/notifier/package.json
RUN npm ci

COPY . .
RUN npm run prisma:generate --workspace=@pulsecheck/api
RUN npm run build --workspace=@pulsecheck/api

FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/package.json ./apps/api/package.json
COPY --from=builder /repo/apps/api/prisma ./apps/api/prisma
COPY database/dump.sql database/dump.sql
COPY database/load-dump.sh database/load-dump.sh

RUN chmod +x database/load-dump.sh

EXPOSE 3001
CMD ["sh", "-c", "database/load-dump.sh && node apps/api/dist/main"]