# Build and Test Summary — Vending Machine Demo

## Quick Reference

| Command | Purpose |
|---|---|
| `npm install` | Install all dependencies |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint code quality |
| `npm test` | Run all tests (unit + PBT) |
| `npm run build` | Production build (client + server) |
| `npm run dev` | Development mode (hot reload) |
| `npm start` | Start production server |
| `docker compose up -d --build` | Full Docker deployment |

## Test Strategy

| Level | Framework | Files | Properties Tested |
|---|---|---|---|
| Unit | Vitest | `tests/unit/*.test.ts` | Service logic, CRUD ops |
| PBT | fast-check | `tests/pbt/*.pbt.ts` | Invariants, round-trips, stateful |
| Integration | Vitest + supertest | `tests/integration/*.test.ts` | HTTP + WebSocket flows |
| Manual | Browser | See integration doc | Multi-device, visual, QR scanning |

## PBT Compliance Summary

| PBT Rule | Status | Evidence |
|---|---|---|
| PBT-01 | Compliant | 7 properties identified in business-rules.md |
| PBT-02 | Compliant | round-trip.pbt.ts (P6) |
| PBT-03 | Compliant | invariants.pbt.ts (P1, P2, P4) |
| PBT-04 | Compliant | invariants.pbt.ts (P3 - reset idempotence) |
| PBT-05 | Compliant | invariants.pbt.ts (P5 - commutativity oracle) |
| PBT-06 | Compliant | product-state.pbt.ts (P7 - stateful model) |
| PBT-07 | Compliant | generators.ts (domain-specific generators) |
| PBT-08 | Compliant | Seed logging via VITEST_SEED, shrinking enabled |
| PBT-09 | Compliant | fast-check 3.x selected, documented in tech-stack |
| PBT-10 | Compliant | Unit tests (example-based) + PBT tests (property-based) separate |

## Security Compliance Summary

| SECURITY Rule | Status | Evidence |
|---|---|---|
| SECURITY-01 | Partial (N/A for storage) | HTTPS in transit via Nginx TLS |
| SECURITY-02 | N/A | No LB/API Gateway |
| SECURITY-03 | Compliant | Winston structured logging |
| SECURITY-04 | Compliant | Helmet + Nginx security headers |
| SECURITY-05 | Compliant | Zod validation on all endpoints |
| SECURITY-06 | Compliant | IAM role with minimal permissions |
| SECURITY-07 | Compliant | Security group restricts ports |
| SECURITY-08 | N/A | No user authentication |
| SECURITY-09 | Compliant | Non-root Docker, pinned images, generic errors |
| SECURITY-10 | Compliant | Pinned deps, lockfile, npm audit in CI |
| SECURITY-11 | Compliant | Rate limiting, misuse cases addressed |
| SECURITY-12 | N/A | No user auth system |
| SECURITY-13 | N/A | No deserialization of untrusted data |
| SECURITY-14 | N/A | Demo project |
| SECURITY-15 | Compliant | Global error handler, fail closed |

## Resiliency Compliance Summary

| RESILIENCY Rule | Status | Rationale |
|---|---|---|
| RESILIENCY-01 | Compliant | Classified as Low criticality demo |
| RESILIENCY-02 | N/A | Single-region, no DR |
| RESILIENCY-03 | N/A | Exempt from change management |
| RESILIENCY-04 | Compliant | CI/CD proposed (GitHub Actions) |
| RESILIENCY-05 | Partial | Structured logging + health check |
| RESILIENCY-06 | Compliant | /health endpoint + Docker health check |
| RESILIENCY-07–15 | N/A | Demo workload, per user decisions |

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Docker image builds (`docker build .`)
- [ ] `.env` configured with production values
- [ ] `SERVER_HOST` set to public domain
- [ ] SSH key configured for EC2 access
- [ ] Security group configured (80, 443, 22)
- [ ] DNS pointing to EC2 elastic IP

### Post-Deployment Verification
- [ ] `curl https://your-domain.com/health` → `{"status":"healthy"}`
- [ ] `curl https://your-domain.com/api/products` → 24 products
- [ ] Laptop view loads with 3D machine
- [ ] QR code scannable from phone
- [ ] Product pick updates both views in real-time
- [ ] Auto-reset fires after configured interval
- [ ] HTTPS certificate valid (no browser warnings)
