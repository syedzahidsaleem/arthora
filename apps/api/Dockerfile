# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@10
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/sdk/package.json ./packages/sdk/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --no-frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10
COPY --from=deps /app ./
COPY . .
RUN pnpm --filter @arthora/shared build
RUN pnpm --filter @arthora/sdk build
RUN pnpm --filter @arthora/api build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Chromium dependencies for puppeteer-core
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  && rm -rf /var/cache/apk/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/sdk/dist ./packages/sdk/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
EXPOSE 4000
HEALTHCHECK --interval=60s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1
CMD ["node", "dist/main.js"]
