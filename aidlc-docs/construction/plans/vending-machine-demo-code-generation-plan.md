# Code Generation Plan — Vending Machine Demo

## Plan Overview
Generate the complete Vending Machine Demo application based on approved design artifacts.

**Unit**: vending-machine-demo (single unit)
**Tech Stack**: TypeScript, Node.js 20, React 18, React Three Fiber, Express, Socket.IO, Vitest, fast-check, Docker, Nginx

---

## Project Structure

```
/
├── src/
│   ├── server/
│   │   ├── index.ts                 # Server entry point
│   │   ├── app.ts                   # Express app setup
│   │   ├── config.ts                # Environment configuration
│   │   ├── middleware/
│   │   │   ├── error-handler.ts     # Global error handler
│   │   │   ├── rate-limiter.ts      # Rate limiting config
│   │   │   ├── request-id.ts        # Request ID generator
│   │   │   └── validation.ts        # Zod validation middleware
│   │   ├── routes/
│   │   │   ├── products.ts          # Product REST endpoints
│   │   │   ├── qr.ts                # QR code endpoint
│   │   │   ├── status.ts            # Status endpoint
│   │   │   └── health.ts            # Health check
│   │   ├── services/
│   │   │   ├── product.service.ts   # Product state management
│   │   │   ├── qr.service.ts        # QR code generation
│   │   │   ├── timer.service.ts     # Auto-reset timer
│   │   │   └── websocket.service.ts # WebSocket hub
│   │   ├── data/
│   │   │   └── products.ts          # Product seed data (24 items)
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript interfaces
│   │   └── logger.ts                # Winston logger configuration
│   │
│   └── client/
│       ├── main.tsx                  # React entry point
│       ├── App.tsx                   # Root component (routing)
│       ├── laptop/
│       │   ├── LaptopApp.tsx         # Laptop root
│       │   ├── VendingMachineScene.tsx  # R3F 3D scene
│       │   ├── ProductSlot.tsx       # 3D product item
│       │   ├── MachineBody.tsx       # 3D machine frame
│       │   ├── QRCodePanel.tsx       # QR display
│       │   ├── StatusBar.tsx         # Status + countdown
│       │   └── ConnectionIndicator.tsx
│       ├── mobile/
│       │   ├── MobileApp.tsx         # Mobile root
│       │   ├── CategoryTabs.tsx      # Category filter
│       │   ├── ProductCard.tsx       # Product card
│       │   ├── ProductGrid.tsx       # Product grid layout
│       │   └── PickConfirmation.tsx  # Pick toast
│       ├── hooks/
│       │   ├── useSocket.ts          # WebSocket hook
│       │   └── useProducts.ts        # REST data hook
│       ├── types/
│       │   └── index.ts             # Client-side types
│       └── styles/
│           └── index.css             # Tailwind imports
│
├── tests/
│   ├── unit/
│   │   ├── product.service.test.ts  # ProductService unit tests
│   │   ├── qr.service.test.ts       # QRService unit tests
│   │   ├── timer.service.test.ts    # TimerService unit tests
│   │   └── validation.test.ts       # Input validation tests
│   ├── pbt/
│   │   ├── generators.ts            # Domain generators (PBT-07)
│   │   ├── product-state.pbt.ts     # Stateful PBT (PBT-06)
│   │   ├── invariants.pbt.ts        # Invariant properties (PBT-03)
│   │   └── round-trip.pbt.ts        # Serialization round-trip (PBT-02)
│   └── integration/
│       ├── api.test.ts              # REST API integration tests
│       └── websocket.test.ts        # WebSocket integration tests
│
├── public/
│   └── images/                       # Product images (placeholder SVGs)
│       ├── fruits/
│       ├── chocolates/
│       ├── snacks/
│       └── drinks/
│
├── nginx/
│   ├── nginx.conf                   # Main Nginx config
│   └── conf.d/
│       └── default.conf             # Server block config
│
├── .github/
│   └── workflows/
│       └── deploy.yml               # CI/CD pipeline
│
├── Dockerfile                        # Multi-stage build
├── docker-compose.yml               # Service orchestration
├── .env.example                     # Environment template
├── .gitignore
├── .eslintrc.cjs                    # ESLint config
├── package.json
├── tsconfig.json                    # TypeScript config (server)
├── tsconfig.client.json             # TypeScript config (client)
├── vite.config.ts                   # Vite build config
├── vitest.config.ts                 # Test config
└── README.md                        # Project documentation
```

---

## Execution Steps

### Phase A: Project Foundation
- [ ] A1: Create package.json with all dependencies (exact versions)
- [ ] A2: Create TypeScript configurations (tsconfig.json, tsconfig.client.json)
- [ ] A3: Create Vite configuration (vite.config.ts)
- [ ] A4: Create Vitest configuration (vitest.config.ts)
- [ ] A5: Create ESLint configuration (.eslintrc.cjs)
- [ ] A6: Create .gitignore and .env.example

### Phase B: Shared Types & Configuration
- [ ] B1: Create shared types (src/server/types/index.ts)
- [ ] B2: Create client types (src/client/types/index.ts)
- [ ] B3: Create server configuration (src/server/config.ts)
- [ ] B4: Create product seed data (src/server/data/products.ts)
- [ ] B5: Create logger configuration (src/server/logger.ts)

### Phase C: Backend Services
- [ ] C1: Create ProductService (src/server/services/product.service.ts)
- [ ] C2: Create QRService (src/server/services/qr.service.ts)
- [ ] C3: Create TimerService (src/server/services/timer.service.ts)
- [ ] C4: Create WebSocketService (src/server/services/websocket.service.ts)

### Phase D: Backend API & Middleware
- [ ] D1: Create middleware (error-handler, rate-limiter, request-id, validation)
- [ ] D2: Create REST routes (products, qr, status, health)
- [ ] D3: Create Express app setup (src/server/app.ts)
- [ ] D4: Create server entry point (src/server/index.ts)

### Phase E: Frontend - Shared
- [ ] E1: Create React entry point and routing (main.tsx, App.tsx)
- [ ] E2: Create WebSocket hook (hooks/useSocket.ts)
- [ ] E3: Create Products hook (hooks/useProducts.ts)
- [ ] E4: Create Tailwind styles (styles/index.css)
- [ ] E5: Create index.html

### Phase F: Frontend - Laptop (3D View)
- [ ] F1: Create LaptopApp.tsx (laptop root)
- [ ] F2: Create VendingMachineScene.tsx (R3F canvas + 3D machine)
- [ ] F3: Create MachineBody.tsx (3D frame/glass)
- [ ] F4: Create ProductSlot.tsx (3D product items)
- [ ] F5: Create QRCodePanel.tsx (QR display)
- [ ] F6: Create StatusBar.tsx + CountdownTimer + ConnectionIndicator

### Phase G: Frontend - Mobile
- [ ] G1: Create MobileApp.tsx (mobile root)
- [ ] G2: Create CategoryTabs.tsx
- [ ] G3: Create ProductGrid.tsx + ProductCard.tsx
- [ ] G4: Create PickConfirmation.tsx

### Phase H: Product Images
- [ ] H1: Create placeholder SVG images for all 24 products

### Phase I: Testing
- [ ] I1: Create domain generators (tests/pbt/generators.ts)
- [ ] I2: Create PBT tests (invariants, round-trip, stateful)
- [ ] I3: Create unit tests (product.service, qr.service, timer.service, validation)
- [ ] I4: Create integration tests (API, WebSocket)

### Phase J: Infrastructure & Deployment
- [ ] J1: Create Dockerfile (multi-stage)
- [ ] J2: Create docker-compose.yml
- [ ] J3: Create Nginx configuration (nginx.conf, conf.d/default.conf)
- [ ] J4: Create .env.example
- [ ] J5: Create GitHub Actions workflow (.github/workflows/deploy.yml)
- [ ] J6: Create README.md with setup instructions

---

## PBT Test Plan (PBT Compliance)

| PBT Rule | Test File | Property |
|---|---|---|
| PBT-02 | round-trip.pbt.ts | Product state serialization/deserialization round-trip |
| PBT-03 | invariants.pbt.ts | Product count invariant (available + sold = 24) |
| PBT-03 | invariants.pbt.ts | Version monotonicity after any operation |
| PBT-04 | invariants.pbt.ts | Reset idempotence (reset(reset(x)) = reset(x)) |
| PBT-05 | invariants.pbt.ts | Pick commutativity (order doesn't affect final state) |
| PBT-06 | product-state.pbt.ts | Stateful model testing (random pick/reset sequences) |
| PBT-07 | generators.ts | Domain generators (Product, ProductId, Category) |

---

**This plan is ready for approval. Once approved, I'll execute each phase to generate the complete application code.**
