# Integration Test Instructions — Vending Machine Demo

## Integration Test Scope

| Test Area | What It Validates |
|---|---|
| REST API | HTTP endpoints return correct responses, status codes, headers |
| WebSocket | Real-time events broadcast correctly, state sync works |
| End-to-End Flow | Pick product → update all clients → QR regenerates |
| Rate Limiting | Requests exceeding limits return 429 |
| Input Validation | Invalid inputs rejected with proper error codes |

## Running Integration Tests

```bash
# Run integration tests only
npx vitest run tests/integration/

# Run specific integration test
npx vitest run tests/integration/api.test.ts
```

## Test File: tests/integration/api.test.ts

**Tests to implement:**

```typescript
describe('REST API Integration', () => {
  // GET /api/products
  it('should return all 24 products')
  it('should include correct product structure')
  
  // GET /api/products/available
  it('should return only available products')
  it('should update after a pick')
  
  // POST /api/products/:id/pick
  it('should pick an available product (200)')
  it('should return 404 for non-existent product')
  it('should return 409 for already-picked product')
  it('should return 400 for invalid product ID format')
  
  // GET /api/qr
  it('should return QR code data')
  it('should update version after pick')
  
  // GET /api/status
  it('should return correct counts')
  
  // GET /health
  it('should return healthy status')
  
  // Security headers
  it('should include X-Content-Type-Options header')
  it('should include X-Frame-Options header')
  it('should include Referrer-Policy header')
  
  // Rate limiting
  it('should return 429 after exceeding rate limit')
  
  // Input validation
  it('should reject SQL injection in product ID')
  it('should reject oversized request bodies')
});
```

## Test File: tests/integration/websocket.test.ts

**Tests to implement:**

```typescript
describe('WebSocket Integration', () => {
  // Connection
  it('should connect successfully')
  it('should receive state_sync on connection')
  it('should join correct room based on client type')
  
  // Pick flow
  it('should broadcast product_updated on successful pick')
  it('should send pick_result to requester')
  it('should send qr_updated to laptop room')
  
  // Error handling
  it('should reject invalid product ID')
  it('should reject pick of sold-out product')
  it('should rate limit excessive pick attempts')
  
  // Reset
  it('should broadcast reset_complete when timer fires')
  
  // Multi-client
  it('should sync state across multiple clients')
  it('should handle race condition (same product, two clients)')
});
```

## Manual Integration Testing

### Test Scenario 1: Basic Pick Flow
1. Open http://localhost:5173 (laptop view)
2. Open http://localhost:5173/mobile (phone view or second browser tab)
3. On mobile: tap a product → should see "You picked X!" toast
4. On laptop: product should grey out within 500ms
5. QR code should pulse (indicating regeneration)

### Test Scenario 2: Multi-Device Sync
1. Open laptop view
2. Scan QR code with actual phone
3. Pick product on phone
4. Verify laptop updates in real-time
5. Pick another product → verify QR changes

### Test Scenario 3: Auto-Reset
1. Pick a few products
2. Wait for countdown timer (default 5 min, or set RESET_INTERVAL_MS=30000 for 30s testing)
3. Verify all products restore to available
4. Verify QR regenerates
5. Verify mobile view shows all products available again

### Test Scenario 4: All Products Sold
1. Pick all 24 products (use REST API for speed):
   ```bash
   for id in fruit-00{1..6} choc-00{1..6} snack-00{1..6} drink-00{1..6}; do
     curl -X POST http://localhost:3001/api/products/$id/pick
   done
   ```
2. Verify "All Sold Out!" state on both views
3. Wait for auto-reset

### Test Scenario 5: Connection Recovery
1. Open mobile view
2. Stop the server (Ctrl+C)
3. Verify "Reconnecting..." indicator appears
4. Restart server
5. Verify auto-reconnection and state sync
