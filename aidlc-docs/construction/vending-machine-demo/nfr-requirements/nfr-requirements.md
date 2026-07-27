# NFR Requirements — Vending Machine Demo

## Performance Requirements

| ID | Requirement | Target | Measurement |
|---|---|---|---|
| PERF-01 | WebSocket message delivery latency | < 500ms end-to-end | Time from emit to client render |
| PERF-02 | Initial page load (laptop) | < 3 seconds | First Contentful Paint on broadband |
| PERF-03 | Initial page load (mobile) | < 3 seconds | First Contentful Paint on 4G/WiFi |
| PERF-04 | QR code regeneration | < 1 second | Time from pick to new QR broadcast |
| PERF-05 | REST API response time | < 200ms (p95) | Server-side response time |
| PERF-06 | 3D scene render (laptop) | 30+ FPS | Stable framerate after initial load |
| PERF-07 | Concurrent connections | Support 50 simultaneous | No degradation with 50 WebSocket clients |

## Scalability Requirements

| ID | Requirement | Target | Notes |
|---|---|---|---|
| SCALE-01 | Concurrent WebSocket connections | 100 max | Single EC2 instance, demo scale |
| SCALE-02 | Products per machine | 24 (fixed) | Not designed for dynamic product count |
| SCALE-03 | Horizontal scaling | Not required | Single instance sufficient for demo |

## Availability Requirements

| ID | Requirement | Target | Notes |
|---|---|---|---|
| AVAIL-01 | Uptime target | Best effort (no formal SLA) | Demo project, acceptable downtime |
| AVAIL-02 | Recovery from crash | Auto-restart via Docker | `restart: unless-stopped` policy |
| AVAIL-03 | State recovery | Accept state loss on restart | In-memory state, no persistence needed |
| AVAIL-04 | Health check | `/health` endpoint | Docker health check integration |

## Security Requirements

| ID | Requirement | SECURITY Rule | Implementation |
|---|---|---|---|
| SEC-01 | HTTPS enforcement | SECURITY-01 | Nginx TLS termination (Let's Encrypt) |
| SEC-02 | Security headers | SECURITY-04 | CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy |
| SEC-03 | Input validation | SECURITY-05 | Zod schema validation on all endpoints |
| SEC-04 | Rate limiting | SECURITY-11 | express-rate-limit: 60/min general, 30/min picks |
| SEC-05 | No hardcoded secrets | SECURITY-12 | Environment variables for all config |
| SEC-06 | Structured logging | SECURITY-03 | Winston logger with JSON format |
| SEC-07 | Global error handler | SECURITY-15 | Express error middleware, generic error responses |
| SEC-08 | Dependency pinning | SECURITY-10 | Exact versions in package.json, lockfile committed |
| SEC-09 | Docker image pinning | SECURITY-10 | Specific tags (node:20-alpine, nginx:1.25-alpine) |
| SEC-10 | No directory listing | SECURITY-09 | Nginx autoindex off |
| SEC-11 | Least privilege | SECURITY-06 | EC2 IAM role with minimal permissions |
| SEC-12 | Network restriction | SECURITY-07 | Security group: only 80, 443 inbound |

### Security Rules N/A Determination

| SECURITY Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Partial | No database/storage (in-memory only). HTTPS in transit: compliant. |
| SECURITY-02 | N/A | No load balancer or API gateway (direct EC2 + Nginx) |
| SECURITY-08 | N/A | No user authentication — all endpoints are public (demo app) |
| SECURITY-12 | N/A | No user authentication system in this demo |
| SECURITY-13 | N/A | No deserialization of untrusted formats, no CDN, no external scripts |
| SECURITY-14 | N/A | Demo project — no formal alerting infrastructure required |

## Reliability Requirements

| ID | Requirement | Target | Implementation |
|---|---|---|---|
| REL-01 | WebSocket auto-reconnect | Within 10 seconds | Socket.IO built-in with exponential backoff |
| REL-02 | Graceful degradation | App usable without WebSocket | REST API fallback for product data |
| REL-03 | Error isolation | One client error doesn't affect others | Per-connection error handling |
| REL-04 | Memory leak prevention | Stable memory over 24h | Proper cleanup on disconnect |

## Observability Requirements

| ID | Requirement | Implementation |
|---|---|---|
| OBS-01 | Structured logging | Winston with JSON format, correlation IDs |
| OBS-02 | Health endpoint | `GET /health` — uptime, connection count, memory |
| OBS-03 | Request logging | Morgan middleware for HTTP requests |
| OBS-04 | Error logging | All errors logged with stack trace (server-side only) |

## Usability Requirements

| ID | Requirement | Target |
|---|---|---|
| USE-01 | No installation required | Browser-only (laptop + phone) |
| USE-02 | Mobile responsiveness | 320px–428px width support |
| USE-03 | Touch targets | Minimum 44×44px |
| USE-04 | Accessibility | WCAG 2.1 AA color contrast |
| USE-05 | Animation respect | Honor `prefers-reduced-motion` |
| USE-06 | WebGL fallback | 2D grid if WebGL unavailable |

## Resiliency Rules Applicability

| RESILIENCY Rule | Status | Rationale |
|---|---|---|
| RESILIENCY-01 | Compliant | Classified as "Low" criticality demo workload |
| RESILIENCY-02 | N/A | User selected E (single-region, no DR) |
| RESILIENCY-03 | N/A | User selected C (exempt from change management) |
| RESILIENCY-04 | Compliant | CI/CD to be proposed; direct deployment acceptable |
| RESILIENCY-05 | Partial | Basic logging + health check; no full observability stack |
| RESILIENCY-06 | Compliant | Health check endpoint implemented |
| RESILIENCY-07 | N/A | Demo workload, no resiliency monitoring needed |
| RESILIENCY-08 | N/A | User selected N/A (single instance acceptable) |
| RESILIENCY-09 | N/A | Single instance, no auto-scaling for demo |
| RESILIENCY-10 | N/A | No external dependencies (no DB, no external APIs) |
| RESILIENCY-11 | N/A | No DR strategy (demo workload) |
| RESILIENCY-12 | N/A | No persistent data to back up |
| RESILIENCY-13 | N/A | No failover procedures (single instance) |
| RESILIENCY-14 | N/A | User selected N/A for resiliency testing |
| RESILIENCY-15 | N/A | User selected N/A for incident response |
