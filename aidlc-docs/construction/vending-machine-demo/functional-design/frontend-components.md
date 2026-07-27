# Frontend Components — Vending Machine Demo

## Component Architecture

### Laptop Application (VendingMachineUI)

```
App
├── VendingMachineScene (R3F Canvas)
│   ├── MachineBody (3D mesh — glass panel, frame, shelves)
│   ├── ProductGrid
│   │   └── ProductSlot[24] (3D positioned product items)
│   │       └── ProductItem (image texture + sold-out overlay)
│   ├── Lighting (ambient + directional)
│   └── Camera (orbit/static)
├── QRCodePanel
│   ├── QRImage (displays QR code)
│   └── QRLabel ("Scan me to pick a product!")
├── StatusBar
│   ├── ProductCounter ("18/24 available")
│   ├── CountdownTimer ("Restocking in 3:42")
│   └── ConnectionIndicator (green dot / "Reconnecting...")
└── ResetAnimation (overlay shown during restock)
```

### Mobile Application (MobileCatalogUI)

```
App
├── Header
│   ├── Title ("Vending Machine")
│   └── ConnectionIndicator
├── CategoryTabs (Fruits | Chocolates | Snacks | Drinks | All)
├── ProductGrid
│   └── ProductCard[24]
│       ├── ProductImage
│       ├── ProductName
│       ├── CategoryBadge
│       └── StatusOverlay (sold-out grey + label)
├── PickConfirmation (toast/modal on successful pick)
└── EmptyState ("All products sold! Restocking in X:XX")
```

---

## Laptop Components Detail

### App (Root)
| Prop/State | Type | Description |
|---|---|---|
| products | Product[] | Current product states |
| qrCode | QRData | Current QR code data |
| resetIn | number | Ms until reset (0 if idle) |
| connected | boolean | WebSocket connection status |

**Lifecycle:**
1. On mount: Connect WebSocket, fetch initial state via REST
2. On `state_sync`: Replace all local state
3. On `product_updated`: Update single product in state
4. On `qr_updated`: Replace QR code state
5. On `countdown_tick`: Update resetIn
6. On `reset_complete`: Replace all products, update QR

---

### VendingMachineScene
| Prop | Type | Description |
|---|---|---|
| products | Product[] | Products to render in 3D grid |

**3D Scene Structure:**
- Canvas: full viewport width/height
- Camera: perspective, positioned for front-facing view
- Machine body: box geometry with glass material (transparent)
- Shelves: 6 horizontal planes
- Products: positioned in 4×6 grid on shelves
- Animation: subtle idle rotation or floating effect

---

### ProductSlot
| Prop | Type | Description |
|---|---|---|
| product | Product | Product data |
| position | [x, y, z] | 3D grid position |

**Behavior:**
- Available: full color texture, subtle hover glow
- Sold out: greyscale filter, 50% opacity, "SOLD OUT" text overlay
- Transition: animate opacity from 1→0.5 over 300ms when picked

---

### QRCodePanel
| Prop | Type | Description |
|---|---|---|
| qrCode | QRData | QR code data URL |
| isUpdating | boolean | Brief flash during regeneration |

**Behavior:**
- Displays QR as `<img>` with base64 src
- On QR update: brief pulse animation (scale 1→1.05→1 over 200ms)
- Label text: "Scan me to pick a product!"
- Min size: 200×200px

---

### CountdownTimer
| Prop | Type | Description |
|---|---|---|
| remainingMs | number | Milliseconds until reset |
| visible | boolean | Show only when timer running |

**Behavior:**
- Format: "Restocking in M:SS"
- Normal: gray text, bottom-right corner
- Final 30s: pulsing orange/red, slightly larger font
- On reset: flash "Restocked!" for 2 seconds, then hide

---

## Mobile Components Detail

### App (Root)
| Prop/State | Type | Description |
|---|---|---|
| products | Product[] | Current product states |
| connected | boolean | WebSocket connection status |
| selectedCategory | Category \| "all" | Active filter tab |
| lastPick | Product \| null | Recently picked product (for toast) |

**Lifecycle:**
1. On mount: Fetch products via REST, connect WebSocket
2. On `state_sync`: Replace all state
3. On `product_updated`: Update product in state
4. On `reset_complete`: Replace all products, clear lastPick

---

### CategoryTabs
| Prop | Type | Description |
|---|---|---|
| selected | Category \| "all" | Active category |
| onSelect | (cat) => void | Category selection handler |
| counts | Record<Category, number> | Available count per category |

**Behavior:**
- Tabs: "All", "Fruits", "Chocolates", "Snacks", "Drinks"
- Shows available count per category badge
- Smooth horizontal scroll on narrow screens

---

### ProductCard
| Prop | Type | Description |
|---|---|---|
| product | Product | Product data |
| onPick | (id) => void | Pick handler |
| disabled | boolean | True if sold_out or picking in progress |

**Behavior:**
- Available: full color, tap target 44×44px minimum, subtle shadow
- Sold out: greyscale, 50% opacity, "Sold Out" overlay, tap disabled
- On tap (available): brief bounce animation, call onPick
- On successful pick: green checkmark animation, then transition to sold-out

---

### PickConfirmation
| Prop | Type | Description |
|---|---|---|
| product | Product \| null | Recently picked product |
| visible | boolean | Show/hide toast |

**Behavior:**
- Appears as bottom toast: "You picked [Product Name]! 🎉"
- Auto-dismiss after 3 seconds
- Slide-up animation on appear, fade-out on dismiss

---

## Shared State Management

### Socket Hook (useSocket)
```typescript
// Custom hook for WebSocket connection management
useSocket(serverUrl: string, clientType: "laptop" | "mobile")
Returns: {
  connected: boolean
  products: Product[]
  qrCode: QRData | null
  resetIn: number
  pickProduct: (id: string) => void
  lastPickResult: PickResult | null
}
```

### API Hook (useProducts)
```typescript
// Custom hook for initial REST data fetch
useProducts()
Returns: {
  products: Product[]
  loading: boolean
  error: Error | null
  refetch: () => void
}
```

---

## Responsive Breakpoints (Mobile)

| Breakpoint | Columns | Card Size | Description |
|---|---|---|---|
| < 360px | 2 | 140px | Small phones |
| 360-428px | 3 | 110px | Standard phones |
| > 428px | 4 | 100px | Large phones/tablets |

---

## Accessibility Considerations

- Product images include `alt` text with product name and status
- Sold-out products have `aria-disabled="true"`
- QR code image has `alt="QR code to scan with phone camera"`
- Connection status announced via `aria-live="polite"` region
- Touch targets minimum 44×44px per WCAG 2.1
- Color contrast ratios meet AA standard (4.5:1 for text)
- Animations respect `prefers-reduced-motion` media query
