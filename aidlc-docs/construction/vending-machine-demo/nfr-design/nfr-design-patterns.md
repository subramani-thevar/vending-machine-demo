# NFR Design Patterns — Vending Machine Demo

## 1. Security Patterns

### Pattern: Security Headers Middleware (SECURITY-04)
```
Request → Helmet Middleware → Route Handler → Response (with headers)
```
- **Implementation**: `helmet` npm package configured as Express middleware
- **Headers Applied**:
  - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' wss:`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **CSP Notes**: `'unsafe-inline'` for styles (Tailwind), `data:` for QR images, `wss:` for WebSocket

### Pattern: Input Validation Gate (SECURITY-05)
```
Request → Zod Schema Validation → (pass) → Handler
                                → (fail) → 400 Error Response
```
- **Implementation**: Zod schemas defined per endpoint, validated in middleware
- **Schemas**:
  - `pickProductSchema`: `{ productId: z.string().regex(/^(fruit|choc|snack|drink)-\d{3}$/) }`
  - `wsPickSchema`: `{ productId: z.string().regex(/^(fruit|choc|snack|drink)-\d{3}$/) }`
- **Payload Size**: Express `body-parser` limit 1KB, Socket.IO `maxHttpBufferSize` 1KB

### Pattern: Rate Limiting (SECURITY-11)
```
Request → Rate Limiter Check → (under limit) → Route Handler
                              → (over limit) → 429 Response
```
- **Implementation**: `express-rate-limit` with in-memory store
- **Configuration**:
  - General endpoints: 60 requests/min per IP, window 1 minute
  - Pick endpoint: 30 requests/min per IP, window 1 minute
  - WebSocket picks: Custom counter, 10 attempts/min per socket

### Pattern: Global Error Handler (SECURITY-15)
```
Any Error → Global Error Middleware → Log Error (internal) → Generic Response (external)
```
- **Implementation**: Express error middleware as last middleware
- **Behavior**:
  - Log full error with stack trace (server-side, Winston)
  - Return `{ error: "Internal server error", code: "INTERNAL_ERROR" }` to client
  - Status code: 500 for unexpected errors
  - Never expose stack traces, paths, or framework details

### Pattern: Structured Logging (SECURITY-03)
```
Event → Winston Logger → JSON Format → stdout (Docker captures)
```
- **Format**: JSON with fields: `timestamp`, `level`, `message`, `requestId`, `method`, `path`
- **Levels**: error, warn, info, debug
- **Production**: info level and above
- **Sensitive Data**: Never log request bodies containing user data, no PII logging
- **Correlation**: UUID request ID generated per HTTP request, attached to all log entries

---

## 2. Performance Patterns

### Pattern: Static Asset Optimization
```
Browser → Nginx → (static files) → Served with cache headers
                → (API/WS) → Proxy to Node.js
```
- **Implementation**: Nginx serves static React build files directly
- **Cache Headers**: `Cache-Control: public, max-age=31536000` for hashed assets (JS, CSS)
- **HTML**: `Cache-Control: no-cache` (always check for updates)
- **Effect**: Reduces Node.js load, faster asset delivery

### Pattern: WebSocket Room Broadcasting
```
Event → WebSocketService → Room.emit() → Only relevant clients receive
```
- **Implementation**: Socket.IO rooms for targeted broadcasts
- **Rooms**: 
  - `laptop`: receives QR updates, countdown ticks
  - `mobile`: receives product updates
  - Broadcast to all: product_updated, reset_complete
- **Effect**: Reduces unnecessary message processing on clients

### Pattern: Debounced Timer Reset
```
Pick → Timer.reset() → Clear existing timeout → Start new timeout
```
- **Implementation**: Each pick restarts the countdown fresh
- **Effect**: Active demos don't get interrupted by unexpected resets

---

## 3. Reliability Patterns

### Pattern: Auto-Reconnection with Exponential Backoff
```
Disconnect → Wait 1s → Retry → Wait 2s → Retry → Wait 4s → ... → Max 10s
```
- **Implementation**: Socket.IO client `reconnection: true` with config
- **Config**:
  - `reconnectionDelay`: 1000ms (initial)
  - `reconnectionDelayMax`: 10000ms (cap)
  - `reconnectionAttempts`: 10 (max attempts)
- **On Success**: Full state sync via `state_sync` event
- **On Failure (10 attempts)**: Display "Please refresh page" message

### Pattern: Full State Sync on Connect
```
New Connection → Server sends complete state → Client replaces local state
```
- **Implementation**: No delta/diff sync, always full state
- **Rationale**: 24 products is small enough that full sync is efficient and eliminates ordering bugs
- **Effect**: Eliminates stale state issues, simplifies reconnection logic

### Pattern: Fail Closed Error Handling
```
Error in pick operation → Don't mutate state → Return error to client
```
- **Implementation**: Validation before mutation, error returns before state change
- **Effect**: System never enters inconsistent state on error

---

## 4. Deployment Patterns

### Pattern: Reverse Proxy with TLS Termination
```
Internet → Nginx (TLS) → HTTP → Node.js App
```
- **Implementation**: Nginx handles HTTPS, proxies to app on internal port 3001
- **TLS**: Let's Encrypt certificate, auto-renewal via Certbot
- **WebSocket**: Nginx configured for WebSocket upgrade (`proxy_set_header Upgrade`)
- **Effect**: App doesn't handle TLS complexity, Nginx handles connection management

### Pattern: Docker Health Check
```
Docker → GET /health every 30s → (200 OK) → Healthy
                                → (no response) → Unhealthy → Restart
```
- **Implementation**: Docker Compose healthcheck + `restart: unless-stopped`
- **Health Endpoint**: Returns `{ status: "healthy", uptime, connections, memory }`
- **Effect**: Automatic recovery from crashes without manual intervention

### Pattern: Environment Configuration
```
docker-compose.yml → environment variables → App reads at startup
```
- **Variables**:
  - `SERVER_HOST`: Public domain/IP for QR URL generation
  - `RESET_INTERVAL_MS`: Auto-reset timer interval (default 300000)
  - `NODE_ENV`: production
  - `PORT`: 3001 (internal)
  - `LOG_LEVEL`: info
  - `MAX_CONNECTIONS`: 100
- **Effect**: No code changes needed for deployment configuration

---

## 5. CI/CD Pattern (GitHub Actions)

### Pattern: Build → Test → Deploy Pipeline
```
Push to main → Build → Lint → Test (+ PBT) → Docker Build → Deploy to EC2
```
- **Stages**:
  1. Install dependencies
  2. TypeScript compile check
  3. ESLint
  4. Vitest (unit + PBT with seed logging)
  5. Docker build (multi-stage)
  6. Push to container registry (ECR or Docker Hub)
  7. SSH to EC2 → docker-compose pull → docker-compose up -d
- **Seed Logging**: PBT seed logged on every CI run for reproducibility (PBT-08)
- **Vulnerability Scan**: `npm audit` as CI step
