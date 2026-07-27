# Application Design — Vending Machine Demo (Consolidated)

## Architecture Summary

A single-page web application with real-time capabilities, deployed as two Docker containers (Nginx + Node.js) on AWS EC2.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend (Laptop) | React 18 + React Three Fiber | 3D vending machine display |
| Frontend (Mobile) | React 18 (responsive) | Product catalog and pick UI |
| Backend | Node.js + Express + Socket.IO | REST API + WebSocket server |
| Infrastructure | Docker Compose + Nginx | Container orchestration + reverse proxy |
| Deployment | AWS EC2 | Public hosting |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Communication | REST + WebSocket (Socket.IO) | REST for initial data, WebSocket for real-time sync |
| State Storage | In-memory (Map) | Demo project, simplest approach, state resets intentionally |
| 3D Rendering | React Three Fiber | Component-based 3D within React ecosystem |
| Monorepo/Split | Single repo, frontend served by backend | Simplest deployment for demo |
| Real-time Library | Socket.IO | Rooms, auto-reconnect, fallback to polling built-in |
| QR Generation | Server-side (`qrcode` npm) | Dynamic QR that changes with state |

---

## System Components (8)

1. **VendingMachineUI** — 3D vending machine (laptop browser, React + R3F)
2. **MobileCatalogUI** — Product catalog (phone browser, React)
3. **APIServer** — REST endpoints (Express)
4. **WebSocketHub** — Real-time communication (Socket.IO)
5. **ProductStateManager** — In-memory product state
6. **QRGenerator** — QR code creation and regeneration
7. **AutoResetTimer** — Periodic restock scheduling
8. **DockerOrchestrator** — Container orchestration (Docker Compose + Nginx)

---

## Service Layer (4 services)

1. **ProductService** — Product inventory and state management
2. **QRService** — QR code generation lifecycle
3. **TimerService** — Auto-reset countdown management
4. **WebSocketService** — Real-time event routing and broadcast

**Pattern:** Event-driven with Node.js EventEmitter for loose coupling between services.

---

## API Surface

### REST Endpoints (6)
- `GET /api/products` — All products with state
- `GET /api/products/available` — Available products only
- `POST /api/products/:id/pick` — Pick a product
- `GET /api/qr` — Current QR code data
- `GET /api/status` — Vending machine status
- `GET /health` — Health check

### WebSocket Events
- **Client → Server**: `pick_product`
- **Server → Client**: `product_updated`, `pick_result`, `qr_updated`, `state_sync`, `reset_complete`, `countdown_tick`, `connection_status`

---

## Core Data Flow

```
Phone scans QR → Opens mobile catalog URL
    → GET /api/products (initial load)
    → WebSocket connect (real-time updates)
    → User taps product
    → WS emit: pick_product
    → Server: ProductService.pickProduct()
    → Server: QRService.regenerate()
    → Server: TimerService.start/reset()
    → WS broadcast: product_updated (all clients)
    → WS broadcast: qr_updated (laptop clients)
    → Laptop: animates product to sold-out, updates QR
    → Phone: confirms pick, greys out product
```

---

## Deployment Architecture

- **AWS EC2** (single instance, single region)
- **Docker Compose** with 2 services:
  - `nginx` — Reverse proxy, HTTPS (Let's Encrypt), security headers
  - `app` — Node.js server serving both API and static React build
- **Security Group**: Ports 80, 443 inbound (public); port 22 from admin IP only
- **No database** — in-memory state, intentional for demo
- **Auto-restart** — Docker restart policy `unless-stopped`

---

## Cross-Reference

- Detailed components: `components.md`
- Method signatures: `component-methods.md`
- Service definitions: `services.md`
- Dependencies and data flow: `component-dependency.md`
