# Components — Vending Machine Demo

## Component Overview

| Component | Type | Responsibility |
|---|---|---|
| VendingMachineUI | Frontend (React + R3F) | 3D vending machine display, QR code display, real-time state rendering |
| MobileCatalogUI | Frontend (React) | Mobile-optimized product catalog, product selection interface |
| APIServer | Backend (Express) | REST endpoints for product data, health checks, server configuration |
| WebSocketHub | Backend (Socket.IO) | Real-time bidirectional communication, state broadcast |
| ProductStateManager | Backend Service | In-memory product state, availability tracking, pick operations |
| QRGenerator | Backend Service | QR code generation with encoded URLs, regeneration on state change |
| AutoResetTimer | Backend Service | Periodic product restock scheduling, timer management |
| DockerOrchestrator | Infrastructure | Container orchestration, service networking, reverse proxy |

---

## Component Details

### 1. VendingMachineUI (Laptop View)

| Attribute | Value |
|---|---|
| **Technology** | React 18 + React Three Fiber + Drei |
| **Runs on** | Laptop browser (Chrome, Firefox, Safari) |
| **Communicates with** | APIServer (REST), WebSocketHub (Socket.IO client) |

**Responsibilities:**
- Render 3D vending machine scene with product grid
- Display products with category colors and availability states
- Show/update QR code (received from backend)
- Animate product state transitions (available → sold out)
- Display auto-reset countdown timer
- Handle WebSocket connection lifecycle (connect, reconnect, disconnect indicator)
- Provide WebGL fallback to 2D grid if WebGL unavailable

---

### 2. MobileCatalogUI (Phone View)

| Attribute | Value |
|---|---|
| **Technology** | React 18 (no 3D, mobile-optimized) |
| **Runs on** | Phone browser (iOS Safari, Android Chrome) |
| **Communicates with** | APIServer (REST), WebSocketHub (Socket.IO client) |

**Responsibilities:**
- Display product grid with images, names, and availability
- Handle product tap/selection (pick action)
- Show pick confirmation animation and message
- Update product states in real-time via WebSocket
- Display connection status indicator
- Responsive layout for mobile screens (320px–428px)
- Touch-friendly targets (minimum 44×44px)

---

### 3. APIServer

| Attribute | Value |
|---|---|
| **Technology** | Node.js + Express |
| **Port** | 3001 (internal), exposed via reverse proxy |
| **Communicates with** | ProductStateManager, QRGenerator |

**Responsibilities:**
- Serve REST API endpoints (product list, product state, health check)
- Serve static frontend assets (production build)
- Apply security headers (CSP, HSTS, X-Content-Type-Options, etc.)
- Input validation on all endpoints
- Rate limiting on public endpoints
- Structured logging (timestamp, request ID, level, message)
- CORS configuration (restricted origins)
- Global error handler (fail closed, generic error messages)

---

### 4. WebSocketHub

| Attribute | Value |
|---|---|
| **Technology** | Socket.IO (integrated with Express server) |
| **Protocol** | WebSocket with HTTP long-polling fallback |
| **Communicates with** | ProductStateManager, all connected clients |

**Responsibilities:**
- Manage WebSocket connections from laptops and phones
- Broadcast product state changes to all connected clients
- Broadcast QR code updates to laptop clients
- Handle race conditions (first-pick-wins for simultaneous attempts)
- Emit auto-reset notifications to all clients
- Connection management (heartbeat, timeout, reconnection support)
- Input validation on incoming WebSocket events

---

### 5. ProductStateManager

| Attribute | Value |
|---|---|
| **Technology** | In-memory JavaScript Map/Object |
| **Persistence** | None (state resets on server restart) |
| **Communicates with** | APIServer, WebSocketHub, QRGenerator, AutoResetTimer |

**Responsibilities:**
- Maintain product inventory (24 products, 4 categories)
- Track availability state per product (available/sold-out)
- Process pick operations (atomic, first-pick-wins)
- Provide current state snapshot for new connections
- Reset all products to available (triggered by AutoResetTimer)
- Emit state change events to WebSocketHub

---

### 6. QRGenerator

| Attribute | Value |
|---|---|
| **Technology** | `qrcode` npm library |
| **Output** | Base64-encoded PNG or SVG data URL |
| **Communicates with** | ProductStateManager, WebSocketHub |

**Responsibilities:**
- Generate QR code encoding the mobile catalog URL
- Include state token/version in QR URL for cache-busting
- Regenerate QR on every product state change
- Provide QR data to WebSocketHub for broadcast to laptop clients
- Ensure generated QR meets minimum scan requirements (error correction level M)

---

### 7. AutoResetTimer

| Attribute | Value |
|---|---|
| **Technology** | Node.js setInterval/setTimeout |
| **Default Interval** | 5 minutes (configurable via RESET_INTERVAL_MS env var) |
| **Communicates with** | ProductStateManager, WebSocketHub |

**Responsibilities:**
- Start countdown timer after first product pick
- Reset timer on each new pick (debounced reset)
- Trigger full product restock when timer expires
- Notify WebSocketHub to broadcast reset event to all clients
- Provide remaining time for countdown display

---

### 8. DockerOrchestrator

| Attribute | Value |
|---|---|
| **Technology** | Docker Compose + Nginx reverse proxy |
| **Runs on** | AWS EC2 instance |
| **Services** | Nginx (port 80/443), App (port 3001 internal) |

**Responsibilities:**
- Container orchestration (app + nginx services)
- Nginx reverse proxy with HTTPS termination
- Security headers at proxy level
- Health check endpoints for container monitoring
- Auto-restart on container failure
- Environment variable configuration
