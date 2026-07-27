# Component Methods — Vending Machine Demo

## APIServer — REST Endpoints

### GET /api/products
- **Purpose**: Retrieve all products with current availability state
- **Input**: None
- **Output**: `{ products: Product[], timestamp: string }`
- **Auth**: Public (no authentication)
- **Rate Limit**: 60 requests/minute per IP

### GET /api/products/available
- **Purpose**: Retrieve only available (not sold-out) products
- **Input**: None
- **Output**: `{ products: Product[], count: number, timestamp: string }`
- **Auth**: Public
- **Rate Limit**: 60 requests/minute per IP

### POST /api/products/:id/pick
- **Purpose**: Mark a product as sold-out (picked up)
- **Input**: `{ productId: string }` (URL param)
- **Output**: `{ success: boolean, product: Product, remainingCount: number }` or `{ error: string, code: string }`
- **Validation**: productId must be valid UUID, product must be available
- **Auth**: Public
- **Rate Limit**: 30 requests/minute per IP
- **Error Codes**: `PRODUCT_NOT_FOUND`, `ALREADY_PICKED`, `INVALID_ID`

### GET /api/qr
- **Purpose**: Get current QR code data (base64 image)
- **Input**: None
- **Output**: `{ qrCode: string (base64), url: string, version: number }`
- **Auth**: Public
- **Rate Limit**: 60 requests/minute per IP

### GET /api/status
- **Purpose**: Get vending machine status (countdown, product counts)
- **Input**: None
- **Output**: `{ totalProducts: number, availableCount: number, soldOutCount: number, resetIn: number (ms), resetIntervalMs: number }`
- **Auth**: Public

### GET /health
- **Purpose**: Health check endpoint for Docker/load balancer
- **Input**: None
- **Output**: `{ status: "healthy", uptime: number, timestamp: string }`
- **Auth**: Public (no rate limit)

---

## WebSocketHub — Event Contracts

### Client → Server Events

#### `pick_product`
- **Purpose**: Client requests to pick a product
- **Payload**: `{ productId: string }`
- **Validation**: productId must be valid, product must be available
- **Response Event**: `pick_result` (to sender), `product_updated` (to all)

### Server → Client Events

#### `product_updated`
- **Purpose**: Broadcast product state change to all clients
- **Payload**: `{ productId: string, status: "sold_out", pickedBy: string (session), timestamp: string }`
- **Recipients**: All connected clients

#### `pick_result`
- **Purpose**: Confirm/deny pick attempt to the requesting client
- **Payload**: `{ success: boolean, productId: string, error?: string }`
- **Recipients**: Requesting client only

#### `qr_updated`
- **Purpose**: Broadcast new QR code to laptop clients
- **Payload**: `{ qrCode: string (base64), url: string, version: number }`
- **Recipients**: Laptop clients only (room: "laptop")

#### `state_sync`
- **Purpose**: Full state sync on connection/reconnection
- **Payload**: `{ products: Product[], qrCode: string, resetIn: number }`
- **Recipients**: Newly connected client

#### `reset_complete`
- **Purpose**: Notify all clients that products have been restocked
- **Payload**: `{ products: Product[], qrCode: string, timestamp: string }`
- **Recipients**: All connected clients

#### `countdown_tick`
- **Purpose**: Periodic countdown update for timer display
- **Payload**: `{ resetIn: number (ms) }`
- **Recipients**: Laptop clients (room: "laptop")
- **Frequency**: Every 10 seconds (reduced near expiry: every 1 second in final 30s)

#### `connection_status`
- **Purpose**: Inform client of connection state changes
- **Payload**: `{ status: "connected" | "reconnecting" | "disconnected" }`
- **Recipients**: Individual client

---

## ProductStateManager — Internal Interface

### initialize()
- **Purpose**: Set up initial product inventory (24 products)
- **Input**: None (loads from product data config)
- **Output**: void
- **Side Effects**: Populates in-memory product map

### getProducts(): Product[]
- **Purpose**: Return all products with current state
- **Input**: None
- **Output**: Array of Product objects

### getAvailableProducts(): Product[]
- **Purpose**: Return only available products
- **Input**: None
- **Output**: Filtered array of available Products

### pickProduct(productId: string): PickResult
- **Purpose**: Atomically mark a product as sold-out
- **Input**: Product ID string
- **Output**: `{ success: boolean, product?: Product, error?: string }`
- **Concurrency**: Synchronized (prevents race conditions)
- **Events Emitted**: `product:picked` if successful

### resetAll(): void
- **Purpose**: Restore all products to available state
- **Input**: None
- **Output**: void
- **Events Emitted**: `products:reset`

### getStatus(): VendingStatus
- **Purpose**: Return summary status
- **Output**: `{ total: number, available: number, soldOut: number }`

---

## QRGenerator — Internal Interface

### generateQR(url: string): Promise<string>
- **Purpose**: Generate QR code as base64 data URL
- **Input**: URL to encode
- **Output**: Base64-encoded PNG data URL
- **Config**: Error correction level M, size 300px, margin 2

### getCurrentQR(): QRData
- **Purpose**: Get current QR code data
- **Output**: `{ qrCode: string, url: string, version: number }`

### regenerate(): Promise<QRData>
- **Purpose**: Regenerate QR with updated state version
- **Output**: New QRData with incremented version
- **Trigger**: Called after every product state change

---

## AutoResetTimer — Internal Interface

### start(): void
- **Purpose**: Start or restart the reset countdown
- **Behavior**: Resets existing timer if running, starts fresh countdown

### stop(): void
- **Purpose**: Stop the countdown timer
- **Behavior**: Clears interval, no reset will fire

### getRemainingTime(): number
- **Purpose**: Get milliseconds until next reset
- **Output**: Remaining time in ms (0 if not running)

### onTick(callback: (remaining: number) => void): void
- **Purpose**: Register callback for countdown updates
- **Frequency**: Every 10 seconds (every 1 second in final 30s)

### onReset(callback: () => void): void
- **Purpose**: Register callback for when timer expires
- **Behavior**: Called once when countdown reaches 0

---

## Data Types

### Product
```typescript
interface Product {
  id: string;           // UUID
  name: string;         // Display name
  category: "fruits" | "chocolates" | "snacks" | "drinks";
  imageUrl: string;     // Path to product image
  status: "available" | "sold_out";
  pickedAt?: string;    // ISO timestamp when picked
}
```

### PickResult
```typescript
interface PickResult {
  success: boolean;
  product?: Product;
  error?: string;
  errorCode?: "PRODUCT_NOT_FOUND" | "ALREADY_PICKED" | "INVALID_ID";
}
```

### QRData
```typescript
interface QRData {
  qrCode: string;   // Base64 data URL
  url: string;      // Encoded URL
  version: number;  // Incrementing version for cache-busting
}
```

### VendingStatus
```typescript
interface VendingStatus {
  totalProducts: number;
  availableCount: number;
  soldOutCount: number;
  resetIn: number;         // ms until reset
  resetIntervalMs: number; // configured interval
}
```
