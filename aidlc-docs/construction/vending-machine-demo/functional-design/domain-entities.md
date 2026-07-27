# Domain Entities — Vending Machine Demo

## Entity Relationship Diagram

```
+-------------------+        +-------------------+
|     Product       |        |   VendingMachine  |
+-------------------+        +-------------------+
| id: UUID          |  N:1   | id: string        |
| name: string      |<------>| products: Product[]|
| category: Category|        | status: MachineStatus
| imageUrl: string  |        | resetInterval: ms |
| status: ProdStatus|        | lastPickAt: Date  |
| pickedAt?: Date   |        | version: number   |
+-------------------+        +-------------------+
                                      |
                                      | 1:1
                                      v
                              +-------------------+
                              |    QRCodeState    |
                              +-------------------+
                              | dataUrl: string   |
                              | encodedUrl: string|
                              | version: number   |
                              | generatedAt: Date |
                              +-------------------+

+-------------------+        +-------------------+
|   ClientSession   |        |   TimerState      |
+-------------------+        +-------------------+
| socketId: string  |        | running: boolean  |
| clientType: Type  |        | startedAt?: Date  |
| connectedAt: Date |        | expiresAt?: Date  |
| room: string      |        | intervalMs: number|
+-------------------+        +-------------------+
```

---

## Entity Definitions

### Product

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | string (UUID v4) | Required, unique, immutable | Product identifier |
| name | string | Required, 1-50 chars | Display name |
| category | Category enum | Required | Product category |
| imageUrl | string | Required, valid path | Path to product image asset |
| status | ProductStatus enum | Required, default "available" | Current availability |
| pickedAt | Date \| null | Null when available | Timestamp when product was picked |

### Category (Enum)

| Value | Display | Color Code | Products |
|---|---|---|---|
| `fruits` | Fruits | #4CAF50 (green) | 6 items |
| `chocolates` | Chocolates | #795548 (brown) | 6 items |
| `snacks` | Snacks | #FF9800 (orange) | 6 items |
| `drinks` | Drinks | #2196F3 (blue) | 6 items |

### ProductStatus (Enum)

| Value | Description | Transition Rules |
|---|---|---|
| `available` | Can be picked | → `sold_out` (via pick operation) |
| `sold_out` | Already picked | → `available` (via reset only) |

### VendingMachine (Aggregate Root)

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | string | Fixed: "main" | Single machine instance |
| products | Product[] | Exactly 24 | Product inventory |
| status | MachineStatus | Required | Machine state |
| resetIntervalMs | number | Min 60000 (1 min) | Auto-reset interval |
| lastPickAt | Date \| null | Null if no picks | Last pick timestamp |
| version | number | Auto-increment | State version for cache-busting |

### MachineStatus (Enum)

| Value | Description | Condition |
|---|---|---|
| `ready` | Has available products | availableCount > 0 |
| `empty` | All products sold out | availableCount === 0 |
| `restocking` | Reset in progress | During reset animation window |

### QRCodeState (Value Object)

| Field | Type | Description |
|---|---|---|
| dataUrl | string | Base64-encoded QR image (PNG) |
| encodedUrl | string | URL encoded in the QR |
| version | number | Matches VendingMachine.version |
| generatedAt | Date | Generation timestamp |

### ClientSession (Transient)

| Field | Type | Description |
|---|---|---|
| socketId | string | Socket.IO connection ID |
| clientType | "laptop" \| "mobile" | Client device type |
| connectedAt | Date | Connection timestamp |
| room | string | Socket.IO room membership |

### TimerState (Value Object)

| Field | Type | Description |
|---|---|---|
| running | boolean | Whether countdown is active |
| startedAt | Date \| null | When timer started |
| expiresAt | Date \| null | When reset will fire |
| intervalMs | number | Configured interval |

---

## Product Seed Data

### Fruits (IDs: fruit-001 through fruit-006)
| ID | Name | Image |
|---|---|---|
| fruit-001 | Apple | /images/fruits/apple.png |
| fruit-002 | Banana | /images/fruits/banana.png |
| fruit-003 | Orange | /images/fruits/orange.png |
| fruit-004 | Grapes | /images/fruits/grapes.png |
| fruit-005 | Watermelon | /images/fruits/watermelon.png |
| fruit-006 | Mango | /images/fruits/mango.png |

### Chocolates (IDs: choc-001 through choc-006)
| ID | Name | Image |
|---|---|---|
| choc-001 | Milk Chocolate | /images/chocolates/milk.png |
| choc-002 | Dark Chocolate | /images/chocolates/dark.png |
| choc-003 | White Chocolate | /images/chocolates/white.png |
| choc-004 | Hazelnut Bar | /images/chocolates/hazelnut.png |
| choc-005 | Caramel Bar | /images/chocolates/caramel.png |
| choc-006 | Mint Chocolate | /images/chocolates/mint.png |

### Snacks (IDs: snack-001 through snack-006)
| ID | Name | Image |
|---|---|---|
| snack-001 | Potato Chips | /images/snacks/chips.png |
| snack-002 | Cookies | /images/snacks/cookies.png |
| snack-003 | Popcorn | /images/snacks/popcorn.png |
| snack-004 | Pretzels | /images/snacks/pretzels.png |
| snack-005 | Granola Bar | /images/snacks/granola.png |
| snack-006 | Trail Mix | /images/snacks/trailmix.png |

### Drinks (IDs: drink-001 through drink-006)
| ID | Name | Image |
|---|---|---|
| drink-001 | Water | /images/drinks/water.png |
| drink-002 | Orange Juice | /images/drinks/oj.png |
| drink-003 | Cola | /images/drinks/cola.png |
| drink-004 | Lemonade | /images/drinks/lemonade.png |
| drink-005 | Iced Tea | /images/drinks/icedtea.png |
| drink-006 | Milk | /images/drinks/milk.png |
