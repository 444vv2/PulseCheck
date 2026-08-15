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
RUN npm run build --workspace=worker

FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/worker/dist ./apps/worker/dist
COPY --from=builder /repo/apps/worker/package.json ./apps/worker/package.json

CMD ["node", "apps/worker/dist/main"]