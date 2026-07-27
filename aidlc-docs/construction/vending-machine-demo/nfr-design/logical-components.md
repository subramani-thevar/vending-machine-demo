# Logical Components — Vending Machine Demo

## Component Architecture with NFR Integration

```
+================================================================+
|                    NGINX REVERSE PROXY                          |
|----------------------------------------------------------------|
| - TLS Termination (Let's Encrypt)                              |
| - Security Headers (CSP, HSTS, X-Content-Type, X-Frame, Ref)  |
| - Static Asset Serving (React build, cache headers)            |
| - WebSocket Upgrade Proxying                                   |
| - Connection Limits                                            |
| - HTTP → HTTPS Redirect                                        |
+================================================================+
                              |
                              v
+================================================================+
|                    EXPRESS APPLICATION                          |
|================================================================|
|                                                                |
|  +----------------------------------------------------------+ |
|  |              MIDDLEWARE PIPELINE                           | |
|  |----------------------------------------------------------| |
|  | 1. Request ID Generator (UUID per request)                | |
|  | 2. Morgan (HTTP access logging)                           | |
|  | 3. Helmet (security headers - backup layer)               | |
|  | 4. CORS (restricted origins)                              | |
|  | 5. Rate Limiter (express-rate-limit)                      | |
|  | 6. Body Parser (1KB limit)                                | |
|  | 7. Zod Validation Middleware (per-route schemas)          | |
|  +----------------------------------------------------------+ |
|                                                                |
|  +----------------------------------------------------------+ |
|  |              ROUTE HANDLERS                               | |
|  |----------------------------------------------------------| |
|  | GET  /api/products          (rate: 60/min)                | |
|  | GET  /api/products/available (rate: 60/min)               | |
|  | POST /api/products/:id/pick (rate: 30/min, validated)     | |
|  | GET  /api/qr                (rate: 60/min)                | |
|  | GET  /api/status            (rate: 60/min)                | |
|  | GET  /health                (no rate limit)               | |
|  +----------------------------------------------------------+ |
|                                                                |
|  +----------------------------------------------------------+ |
|  |              SOCKET.IO SERVER                             | |
|  |----------------------------------------------------------| |
|  | - Connection handler (type detection, room assignment)    | |
|  | - Event validation (Zod schemas on incoming events)       | |
|  | - Per-socket rate limiting (10 picks/min)                 | |
|  | - Room broadcasting (laptop, mobile)                      | |
|  | - Auto-reconnection support                              | |
|  | - Max connections: 100                                    | |
|  | - Max buffer size: 1KB                                    | |
|  +----------------------------------------------------------+ |
|                                                                |
|  +----------------------------------------------------------+ |
|  |              SERVICE LAYER                                | |
|  |----------------------------------------------------------| |
|  |                                                            | |
|  |  +------------------+     +---------------------+         | |
|  |  | ProductService   |     | QRService           |         | |
|  |  |------------------|     |---------------------|         | |
|  |  | State: Map<>     |---->| qrcode library      |         | |
|  |  | Atomic picks     |     | Version tracking    |         | |
|  |  | Event emitter    |     | Base64 encoding     |         | |
|  |  +------------------+     +---------------------+         | |
|  |           |                                                | |
|  |  +------------------+     +---------------------+         | |
|  |  | TimerService     |     | WebSocketService    |         | |
|  |  |------------------|     |---------------------|         | |
|  |  | setInterval      |     | Event routing       |         | |
|  |  | setTimeout       |     | Room management     |         | |
|  |  | Configurable     |     | State sync          |         | |
|  |  +------------------+     +---------------------+         | |
|  |                                                            | |
|  +----------------------------------------------------------+ |
|                                                                |
|  +----------------------------------------------------------+ |
|  |              CROSS-CUTTING CONCERNS                       | |
|  |----------------------------------------------------------| |
|  | - Winston Logger (JSON, stdout, correlation ID)           | |
|  | - Global Error Handler (catch-all, generic responses)     | |
|  | - Graceful Shutdown (SIGTERM handler, close connections)   | |
|  +----------------------------------------------------------+ |
|                                                                |
+================================================================+
```

---

## Logical Component Details

### 1. Request ID Generator
| Attribute | Value |
|---|---|
| Purpose | Unique ID per HTTP request for log correlation |
| Implementation | `uuid.v4()` middleware, sets `req.id` and response header `X-Request-ID` |
| Used By | Winston logger, error handler, all route handlers |

### 2. Rate Limiter
| Attribute | Value |
|---|---|
| Purpose | Prevent abuse of public endpoints |
| Implementation | `express-rate-limit` with in-memory store |
| Configurations | General: 60/min, Pick: 30/min, WS Pick: 10/min per socket |
| Response on limit | HTTP 429 `{ error: "Too many requests", code: "RATE_LIMITED" }` |
| Reset | Window resets after 1 minute |

### 3. Validation Middleware
| Attribute | Value |
|---|---|
| Purpose | Validate all inputs before processing |
| Implementation | Zod schemas applied per route |
| Behavior | Parse input → success: pass to handler / fail: 400 error |
| Coverage | URL params, query strings, request bodies, WebSocket payloads |

### 4. Winston Logger
| Attribute | Value |
|---|---|
| Purpose | Structured application logging |
| Format | JSON: `{ timestamp, level, message, requestId, ...meta }` |
| Output | stdout (captured by Docker) |
| Levels | error, warn, info, debug (production: info+) |
| Integration | Docker logs → can pipe to CloudWatch if needed later |

### 5. Global Error Handler
| Attribute | Value |
|---|---|
| Purpose | Catch unhandled errors, prevent crashes |
| Implementation | Express error middleware (4 args: err, req, res, next) |
| Behavior | Log full error internally, return generic 500 to client |
| Coverage | Sync throws + async rejections (express-async-errors) |

### 6. Graceful Shutdown Handler
| Attribute | Value |
|---|---|
| Purpose | Clean shutdown on SIGTERM (Docker stop) |
| Implementation | Process signal handlers |
| Behavior | Close WebSocket connections → close HTTP server → exit |
| Timeout | 10 seconds maximum shutdown time |

---

## Docker Compose Service Architecture

```yaml
services:
  nginx:
    image: nginx:1.25-alpine
    ports: ["80:80", "443:443"]
    depends_on: [app]
    healthcheck: wget --spider http://localhost:80/health
    restart: unless-stopped

  app:
    build: .
    expose: ["3001"]
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SERVER_HOST=${SERVER_HOST}
      - RESET_INTERVAL_MS=${RESET_INTERVAL_MS:-300000}
      - LOG_LEVEL=info
      - MAX_CONNECTIONS=100
    healthcheck: wget --spider http://localhost:3001/health
    restart: unless-stopped
```

---

## Nginx Configuration Components

| Component | Purpose | Configuration |
|---|---|---|
| TLS Block | HTTPS with Let's Encrypt | `ssl_certificate`, `ssl_certificate_key`, TLS 1.2+ only |
| HTTP Redirect | Force HTTPS | `return 301 https://$host$request_uri` |
| Proxy Pass | Route to Node.js | `proxy_pass http://app:3001` |
| WebSocket Upgrade | Support Socket.IO | `proxy_set_header Upgrade $http_upgrade` |
| Static Files | Serve React build | `location /assets/ { root /usr/share/nginx/html; }` |
| Security Headers | Defense in depth | Backup CSP, X-Frame-Options at Nginx level |
| Connection Limits | Prevent DoS | `limit_conn_zone`, `limit_req_zone` |

---

## Security Layer Defense in Depth

```
Layer 1: Nginx
  - TLS termination
  - Connection rate limiting
  - Security headers (first layer)
  - Request size limits

Layer 2: Express Middleware
  - Helmet security headers (backup)
  - CORS enforcement
  - Rate limiting (per-IP)
  - Body size limits
  - Request ID injection

Layer 3: Route Validation
  - Zod schema validation
  - Input sanitization
  - Format enforcement

Layer 4: Business Logic
  - State validation (product exists, is available)
  - Atomic operations (no race conditions)
  - Fail-closed error handling

Layer 5: Response
  - Generic error messages
  - No internal data exposure
  - Proper status codes
```
