# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

# Copy server build (compiled from src/server/ to dist/)
COPY --from=builder /app/dist ./dist
# Copy node_modules (production only would be better, but keeping simple)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# Copy public assets into the client build directory
COPY --from=builder /app/public ./dist/client

USER appuser
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
