# Business Rules — Vending Machine Demo

## BR-01: Product Pick Rules

### BR-01.1: Single Pick Atomicity
- A product can only be picked ONCE
- If two clients attempt to pick the same product simultaneously, only the FIRST request succeeds
- Implementation: Synchronous state check + update (no async gap between check and mutation)

### BR-01.2: Pick Validation
- Product ID must exist in the inventory
- Product must have status `available`
- If product is already `sold_out`, return error `ALREADY_PICKED` (not a server error, just a conflict)
- If product ID is invalid/unknown, return error `PRODUCT_NOT_FOUND`

### BR-01.3: Pick State Transition
```
available → sold_out (irreversible within session, only reset can reverse)
sold_out → available (only via auto-reset, never via user action)
```

### BR-01.4: Pick Side Effects (executed in order)
1. Product status changes to `sold_out`
2. Product `pickedAt` set to current timestamp
3. VendingMachine `version` increments
4. VendingMachine `lastPickAt` updates
5. AutoResetTimer starts (if first pick) or resets countdown (if already running)
6. QR code regenerates with new version
7. All connected clients notified via WebSocket

---

## BR-02: Auto-Reset Rules

### BR-02.1: Timer Start Condition
- Timer starts on the FIRST product pick (not on page load)
- Timer does NOT run when all products are available (no picks yet)

### BR-02.2: Timer Reset Behavior
- Each new pick resets the countdown back to full interval
- This means: if interval = 5 min, and a pick happens at 3 min remaining, timer resets to 5 min
- Rationale: Active use should not trigger unexpected reset

### BR-02.3: Timer Expiry Action
When timer reaches 0:
1. All products set to `available` (status reset)
2. All `pickedAt` fields cleared (set to null)
3. VendingMachine `version` increments
4. VendingMachine `status` becomes `ready`
5. QR code regenerates
6. Timer stops (waits for next pick to restart)
7. All clients notified via `reset_complete` event

### BR-02.4: Timer Configuration
- Default interval: 300000 ms (5 minutes)
- Minimum interval: 60000 ms (1 minute)
- Maximum interval: 3600000 ms (60 minutes)
- Configurable via `RESET_INTERVAL_MS` environment variable
- If env var is invalid (non-numeric, below min, above max), use default

### BR-02.5: All Products Sold Out
- When the 24th (last) product is picked:
  - Machine status becomes `empty`
  - Timer continues normally (no special acceleration)
  - Clients display "All Sold Out!" messaging
  - QR shows "restocking soon" messaging

---

## BR-03: QR Code Rules

### BR-03.1: QR URL Construction
- QR encodes: `https://{SERVER_HOST}/mobile?v={version}`
- `SERVER_HOST` from environment variable (public domain/IP)
- `v` parameter is the current VendingMachine version (cache-busting)

### BR-03.2: QR Regeneration Triggers
QR must regenerate on:
1. Any product pick (version change)
2. Auto-reset (version change)
3. Server start (initial generation)

### BR-03.3: QR Requirements
- Error correction level: M (15% data recovery)
- Size: 300×300px
- Format: PNG as base64 data URL
- Margin: 2 modules
- Colors: Black on white (maximum contrast)

### BR-03.4: Old QR URL Behavior
- Old QR URLs (with previous version numbers) still work
- They serve the CURRENT state (not the state at time of QR generation)
- Version param is for cache-busting only, not for state lookup

---

## BR-04: WebSocket Connection Rules

### BR-04.1: Client Type Identification
- Clients identify their type via query parameter on connection: `?type=laptop` or `?type=mobile`
- Laptop clients join room "laptop" (receive QR updates, countdown ticks)
- Mobile clients join room "mobile" (receive product updates)
- Both rooms receive: `product_updated`, `reset_complete`, `state_sync`

### BR-04.2: Connection State Sync
- On new connection: server sends full state via `state_sync` event
- On reconnection: server sends full state (not delta/diff)
- Client must replace local state entirely on `state_sync`

### BR-04.3: Reconnection Policy
- Client-side: Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 10s)
- Max reconnection attempts: 10
- After 10 failed attempts: display "Please refresh" message
- During reconnection: display "Reconnecting..." indicator

### BR-04.4: Race Condition Handling
- Server processes picks sequentially (single-threaded Node.js)
- If two clients emit `pick_product` for same product:
  - First processed: receives `pick_result { success: true }`
  - Second processed: receives `pick_result { success: false, error: "ALREADY_PICKED" }`
  - Both receive `product_updated` broadcast (product now sold_out)

---

## BR-05: Countdown Display Rules

### BR-05.1: Countdown Visibility
- Countdown is visible ONLY on laptop view
- Countdown is NOT shown on mobile view
- Countdown appears only when timer is running (after first pick)

### BR-05.2: Countdown Broadcast Frequency
- Normal: every 10 seconds
- Final 30 seconds: every 1 second
- Format: minutes:seconds (e.g., "4:30", "0:05")

### BR-05.3: Countdown Visual Behavior
- Positioned in non-intrusive location (bottom-right corner)
- Normal: subtle gray text
- Final 30 seconds: pulsing orange/red text
- On reset: brief "Restocked!" flash animation

---

## BR-06: Input Validation Rules

### BR-06.1: Product ID Validation
- Must match pattern: `^(fruit|choc|snack|drink)-\\d{3}$`
- Must exist in product inventory
- Maximum length: 10 characters

### BR-06.2: WebSocket Payload Validation
- `pick_product` payload must have `productId` field (string)
- Payload size limit: 1KB
- Reject payloads with unexpected fields (strict schema)

### BR-06.3: Rate Limiting
- REST endpoints: 60 req/min per IP (general), 30 req/min per IP (pick endpoint)
- WebSocket events: 10 pick attempts/min per connection
- Exceeded limit: return 429 (REST) or error event (WebSocket)

---

## BR-07: Error Handling Rules

### BR-07.1: Fail Closed Principle
- On unexpected error: deny the operation, don't mutate state
- On validation failure: return specific error code, don't process
- On WebSocket error: disconnect client gracefully, client auto-reconnects

### BR-07.2: Error Response Format (REST)
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "timestamp": "ISO-8601"
}
```
- Never expose stack traces, internal paths, or framework details
- Error codes: `PRODUCT_NOT_FOUND`, `ALREADY_PICKED`, `INVALID_ID`, `RATE_LIMITED`, `INTERNAL_ERROR`

### BR-07.3: Error Response Format (WebSocket)
```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

---

## Testable Properties (PBT-01 Compliance)

### Property P1: Product Count Invariant (Invariant)
- `availableCount + soldOutCount === 24` ALWAYS
- After any pick or reset, total product count remains 24

### Property P2: Pick Idempotency Prevention (Invariant)
- Picking an already-sold-out product never changes state
- `pick(soldOutProduct) → state unchanged`

### Property P3: Reset Restores All (Idempotence)
- `reset(reset(state)) === reset(state)` — resetting an already-reset state is a no-op
- After reset: `availableCount === 24 AND soldOutCount === 0`

### Property P4: Version Monotonicity (Invariant)
- VendingMachine.version is strictly monotonically increasing
- `version_after > version_before` for any state-changing operation

### Property P5: Pick Commutativity (Commutativity)
- Picking products A then B yields same final state as picking B then A
- Order of picks doesn't affect final inventory state (only pickedAt timestamps differ)

### Property P6: State Serialization Round-Trip (Round-trip)
- `deserialize(serialize(state)) === state`
- Product state can be serialized to JSON and deserialized back identically

### Property P7: Stateful Vending Machine Model (Stateful)
- Random sequences of pick and reset operations against the real system match a simplified model
- Model: Map<id, boolean> where pick(id) sets true, reset() sets all false
