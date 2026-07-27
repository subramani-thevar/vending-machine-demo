# Services — Vending Machine Demo

## Service Architecture Overview

The application uses a layered service architecture within a single Node.js process:

```
+------------------+     +------------------+
| VendingMachineUI |     | MobileCatalogUI  |
| (Laptop Browser) |     | (Phone Browser)  |
+--------+---------+     +--------+---------+
         |                         |
         | HTTP + WebSocket        | HTTP + WebSocket
         |                         |
+--------v-------------------------v---------+
|              Nginx Reverse Proxy           |
|         (HTTPS termination, headers)       |
+--------------------+----------------------+
                     |
                     v
+--------------------+----------------------+
|           Express + Socket.IO Server      |
|                                            |
|  +-------------+  +-------------------+   |
|  | REST Router |  | WebSocket Handler |   |
|  +------+------+  +---------+---------+   |
|         |                   |              |
|  +------v-------------------v----------+  |
|  |          Service Layer              |  |
|  |                                      |  |
|  |  +--------------+  +-------------+  |  |
|  |  | ProductState |  | QRGenerator |  |  |
|  |  |   Manager    |  |             |  |  |
|  |  +------+-------+  +------+------+  |  |
|  |         |                  |         |  |
|  |  +------v------------------v------+  |  |
|  |  |       AutoResetTimer          |  |  |
|  |  +-------------------------------+  |  |
|  +--------------------------------------+  |
+--------------------------------------------+
```

---

## Service Definitions

### 1. ProductService

| Attribute | Value |
|---|---|
| **Module** | `src/services/product.service.ts` |
| **Depends on** | Product data configuration |
| **Used by** | REST Router, WebSocket Handler |

**Responsibilities:**
- Initialize product inventory from configuration
- Manage product availability state (in-memory Map)
- Process pick requests with atomic state transitions
- Provide state snapshots for new client connections
- Execute full restock (reset all to available)
- Emit domain events on state changes

**Orchestration Pattern:** Event-driven — ProductService emits events (`product:picked`, `products:reset`) that other services listen to.

---

### 2. QRService

| Attribute | Value |
|---|---|
| **Module** | `src/services/qr.service.ts` |
| **Depends on** | ProductService (listens to events), Server config (public URL) |
| **Used by** | REST Router, WebSocket Handler |

**Responsibilities:**
- Generate QR codes encoding the mobile catalog URL
- Listen to ProductService events and regenerate QR on state changes
- Maintain current QR version for cache-busting
- Provide current QR data on demand

**Orchestration Pattern:** Reactive — listens to ProductService events, regenerates QR, emits `qr:updated` event for WebSocketHub.

---

### 3. TimerService

| Attribute | Value |
|---|---|
| **Module** | `src/services/timer.service.ts` |
| **Depends on** | ProductService (triggers reset), configuration (interval) |
| **Used by** | WebSocket Handler (countdown ticks) |

**Responsibilities:**
- Manage auto-reset countdown timer
- Start timer on first product pick
- Reset timer countdown on each subsequent pick
- Trigger ProductService.resetAll() when timer expires
- Emit countdown tick events for UI display
- Configurable interval via environment variable

**Orchestration Pattern:** Scheduler — manages time-based state transitions, coordinates with ProductService for restock.

---

### 4. WebSocketService

| Attribute | Value |
|---|---|
| **Module** | `src/services/websocket.service.ts` |
| **Depends on** | Socket.IO server instance, ProductService, QRService, TimerService |
| **Used by** | All connected clients |

**Responsibilities:**
- Manage Socket.IO server and client connections
- Route incoming events (pick_product) to ProductService
- Broadcast state changes to all connected clients
- Manage rooms (laptop vs mobile clients)
- Handle connection lifecycle (connect, disconnect, reconnect)
- Provide full state sync on new connections
- Validate incoming event payloads
- Handle race conditions (concurrent picks)

**Orchestration Pattern:** Hub/Mediator — central point for all real-time communication, listens to all service events and broadcasts to clients.

---

## Service Interaction Flow

### Pick Product Flow
```
Phone taps product
    → Socket.IO: emit("pick_product", { productId })
    → WebSocketService validates payload
    → ProductService.pickProduct(productId)
        → If success: emit event "product:picked"
            → QRService listens → regenerates QR → emits "qr:updated"
            → TimerService listens → resets/starts countdown
            → WebSocketService listens → broadcasts to all clients:
                - "product_updated" to all
                - "pick_result" (success) to sender
                - "qr_updated" to laptop room
        → If fail (already picked): 
            → WebSocketService sends "pick_result" (failure) to sender only
```

### Auto-Reset Flow
```
Timer expires
    → TimerService triggers callback
    → ProductService.resetAll()
        → emits "products:reset"
            → QRService listens → regenerates QR with all products
            → WebSocketService listens → broadcasts:
                - "reset_complete" to all clients
                - "qr_updated" to laptop room
    → TimerService stops (waits for next pick to restart)
```

### New Connection Flow
```
Client connects via Socket.IO
    → WebSocketService detects new connection
    → Determines client type (laptop vs mobile) via query param
    → Joins appropriate room
    → Sends "state_sync" with:
        - Current product states
        - Current QR code
        - Time until next reset
```
