# Business Logic Model — Vending Machine Demo

## Core Business Processes

### Process 1: Product Pick

```
Input: productId (string)
Output: PickResult { success, product?, error? }

Algorithm:
1. VALIDATE productId format (regex: ^(fruit|choc|snack|drink)-\d{3}$)
   → If invalid: return { success: false, error: "INVALID_ID" }
2. LOOKUP product in inventory by ID
   → If not found: return { success: false, error: "PRODUCT_NOT_FOUND" }
3. CHECK product.status
   → If "sold_out": return { success: false, error: "ALREADY_PICKED" }
4. MUTATE product.status = "sold_out"
5. SET product.pickedAt = Date.now()
6. INCREMENT machine.version
7. UPDATE machine.lastPickAt = Date.now()
8. UPDATE machine.status (check if all sold out → "empty")
9. TRIGGER side effects:
   a. Timer: start or reset countdown
   b. QR: regenerate with new version
   c. WebSocket: broadcast product_updated to all
   d. WebSocket: broadcast qr_updated to laptop room
   e. WebSocket: send pick_result(success) to sender
10. RETURN { success: true, product: updatedProduct }
```

---

### Process 2: Auto-Reset (Restock)

```
Trigger: Timer expiry
Output: void (side effects only)

Algorithm:
1. FOR EACH product in inventory:
   a. SET product.status = "available"
   b. SET product.pickedAt = null
2. INCREMENT machine.version
3. SET machine.status = "ready"
4. SET machine.lastPickAt = null
5. STOP timer (wait for next pick)
6. REGENERATE QR code with new version
7. BROADCAST reset_complete to all clients (includes full product list + new QR)
```

---

### Process 3: QR Code Generation

```
Input: server host, machine version
Output: QRData { dataUrl, encodedUrl, version }

Algorithm:
1. CONSTRUCT URL: https://{SERVER_HOST}/mobile?v={version}
2. GENERATE QR code from URL:
   - Error correction: M
   - Size: 300x300
   - Format: PNG
   - Margin: 2 modules
3. ENCODE as base64 data URL
4. RETURN { dataUrl: base64String, encodedUrl: url, version: version }
```

---

### Process 4: New Client Connection

```
Input: socket connection, clientType query param
Output: void (sends state_sync event)

Algorithm:
1. PARSE clientType from connection query (?type=laptop|mobile)
2. IF clientType === "laptop": join room "laptop"
   ELSE: join room "mobile"
3. GATHER current state:
   a. products: all products with current status
   b. qrCode: current QR data
   c. resetIn: timer remaining time (0 if not running)
4. EMIT "state_sync" to new client with gathered state
5. LOG connection in structured logger
```

---

### Process 5: Timer Management

```
State: { running, startedAt, expiresAt, intervalMs, tickInterval }

start():
1. IF already running: clearInterval + clearTimeout
2. SET startedAt = Date.now()
3. SET expiresAt = startedAt + intervalMs
4. SET running = true
5. START tick interval:
   - If remaining > 30s: tick every 10s
   - If remaining <= 30s: tick every 1s
   - On each tick: emit countdown_tick to laptop room
6. SET timeout for expiry:
   - On expiry: call reset callback, set running = false

reset() [called on each pick]:
1. CLEAR existing timeout and intervals
2. CALL start() (fresh countdown)

stop():
1. CLEAR timeout and intervals
2. SET running = false

getRemainingTime():
1. IF not running: return 0
2. RETURN max(0, expiresAt - Date.now())
```

---

## State Machine: Product Lifecycle

```
                  pick(id)
    +----------+  ────────>  +-----------+
    | available |             | sold_out  |
    +----------+  <────────  +-----------+
                   reset()
```

## State Machine: Vending Machine

```
                        first pick
    +-------+  ──────────────────>  +---------+
    | ready  |                       | ready   |
    | (idle) |                       | (timer) |
    +---+---+                       +----+----+
        ^                                |
        |           reset()              |  last product picked
        +────────────────────────────────+
        |                                |
        |                                v
        |           reset()         +---------+
        +<──────────────────────────| empty   |
                                    | (timer) |
                                    +---------+
```

---

## Concurrency Model

### Single-Threaded Execution
- Node.js single thread handles all requests sequentially
- Product state mutations are synchronous (no async between check and update)
- No locks needed — natural serialization via event loop

### Race Condition Prevention
- WebSocket events processed one at a time via event loop
- Two simultaneous `pick_product` events for same product:
  - Event loop dequeues first: processes pick → success
  - Event loop dequeues second: checks status → already sold_out → failure
- No database transactions needed (in-memory, single-threaded)

---

## Misuse Case Analysis (SECURITY-11 Compliance)

### Misuse Case 1: Rapid Pick Spam
- **Threat**: Client sends rapid pick_product events to monopolize all products
- **Mitigation**: Rate limit of 10 pick attempts/min per WebSocket connection
- **Behavior**: After limit exceeded, subsequent picks return error without processing

### Misuse Case 2: Invalid Product ID Injection
- **Threat**: Client sends malformed product IDs attempting to cause errors
- **Mitigation**: Strict regex validation (`^(fruit|choc|snack|drink)-\\d{3}$`)
- **Behavior**: Invalid IDs rejected at validation layer, never reach state manager

### Misuse Case 3: Massive WebSocket Connections
- **Threat**: Attacker opens thousands of connections to exhaust server resources
- **Mitigation**: Socket.IO connection limit (max 100 concurrent connections)
- **Behavior**: New connections rejected after limit with appropriate error

### Misuse Case 4: Oversized Payloads
- **Threat**: Client sends massive payloads via WebSocket
- **Mitigation**: Socket.IO maxHttpBufferSize set to 1KB for this application
- **Behavior**: Oversized payloads rejected, connection not terminated
