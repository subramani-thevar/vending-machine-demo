# Tech Stack Decisions — Vending Machine Demo

## Runtime & Languages

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Runtime | Node.js | 20 LTS (Alpine) | Long-term support, lightweight Docker image |
| Language | TypeScript | 5.x | Type safety, better developer experience, catches errors at compile time |
| Package Manager | npm | 10.x | Bundled with Node.js, lockfile support |

## Frontend Stack

| Technology | Version | Purpose | Rationale |
|---|---|---|---|
| React | 18.x | UI framework | Component-based, large ecosystem, user preference |
| React Three Fiber | 8.x | 3D rendering | React-native integration with Three.js, declarative 3D |
| Three.js | 0.160+ | 3D engine | Industry standard WebGL library |
| @react-three/drei | 9.x | R3F helpers | Pre-built 3D components, camera controls |
| Vite | 5.x | Build tool | Fast HMR, optimized production builds |
| Socket.IO Client | 4.x | WebSocket client | Matches server Socket.IO version |
| Tailwind CSS | 3.x | Styling | Utility-first, rapid UI development, small bundle |

## Backend Stack

| Technology | Version | Purpose | Rationale |
|---|---|---|---|
| Express | 4.x | HTTP server | Mature, minimal, extensive middleware ecosystem |
| Socket.IO | 4.x | WebSocket server | Rooms, auto-reconnect, HTTP fallback built-in |
| Zod | 3.x | Input validation | TypeScript-first schema validation, SECURITY-05 compliance |
| Winston | 3.x | Structured logging | JSON format, multiple transports, SECURITY-03 compliance |
| Morgan | 1.x | HTTP request logging | Express middleware for access logs |
| express-rate-limit | 7.x | Rate limiting | Per-IP rate limiting, SECURITY-11 compliance |
| helmet | 7.x | Security headers | Sets CSP, HSTS, X-Content-Type-Options, SECURITY-04 compliance |
| cors | 2.x | CORS configuration | Restricted origin configuration |
| qrcode | 1.x | QR generation | Server-side QR code creation, multiple output formats |
| uuid | 9.x | ID generation | UUID v4 for product IDs |

## Testing Stack

| Technology | Version | Purpose | Rationale |
|---|---|---|---|
| Vitest | 1.x | Test runner | Fast, Vite-native, TypeScript support |
| fast-check | 3.x | Property-based testing | PBT-09 compliance, integrates with Vitest |
| @testing-library/react | 14.x | Component testing | Standard React testing utilities |
| supertest | 6.x | HTTP testing | Express integration testing |

## Infrastructure Stack

| Technology | Version | Purpose | Rationale |
|---|---|---|---|
| Docker | 24.x | Containerization | Consistent environments, easy deployment |
| Docker Compose | 2.x | Service orchestration | Multi-container management |
| Nginx | 1.25-alpine | Reverse proxy | TLS termination, security headers, WebSocket proxy |
| Certbot | Latest | TLS certificates | Free Let's Encrypt certificates |
| GitHub Actions | N/A | CI/CD pipeline | Proposed per user request, free tier available |

## Deployment Stack

| Technology | Purpose | Rationale |
|---|---|---|
| AWS EC2 (t3.small) | Compute | User has AWS account, sufficient for demo |
| Amazon Linux 2023 | OS | AWS-optimized, long support |
| Let's Encrypt | TLS certificates | Free, automated renewal |
| Docker Compose | Orchestration | Simple, no Kubernetes needed for single instance |

## Key Architecture Constraints

| Constraint | Decision | Impact |
|---|---|---|
| Single process | Express + Socket.IO in one process | Simplifies deployment, limits to ~100 concurrent WS |
| In-memory state | No database | State lost on restart (acceptable for demo) |
| Monorepo | Frontend + Backend in one repo | Simplified CI/CD, single Docker build |
| Static serving | Express serves React build | No separate CDN/static hosting needed |
| Single instance | No load balancer | Direct EC2 access via Nginx |

## Dependency Security (SECURITY-10)

| Practice | Implementation |
|---|---|
| Exact versions | All dependencies pinned to exact versions in package.json |
| Lockfile | package-lock.json committed to git |
| Vulnerability scan | `npm audit` in CI pipeline |
| No unused deps | Regular `depcheck` verification |
| Docker pinning | `node:20-alpine`, `nginx:1.25-alpine` (no `:latest`) |
| Trusted registries | npm public registry only |

## PBT Framework Selection (PBT-09)

| Decision | Value |
|---|---|
| Framework | fast-check 3.x |
| Test Runner Integration | Vitest (native ES module support) |
| Custom Generators | Domain generators for Product, ProductId, Category |
| Shrinking | Enabled (fast-check default) |
| Seed Logging | Enabled in CI (seed logged on failure) |
| CI Integration | Included in `npm test` command |
