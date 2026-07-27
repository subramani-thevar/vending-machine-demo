# Requirements Document — Vending Machine Demo

## Intent Analysis

| Attribute | Value |
|---|---|
| **User Request** | Create a Vending Machine Demo web application with QR code scanning, real-time product tracking, 3D/animated UI, and Docker deployment on AWS EC2 |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | Multiple Components (frontend, backend, real-time sync, Docker, AWS) |
| **Complexity Estimate** | Moderate (WebSocket real-time sync, QR generation, 3D UI, Docker deployment) |
| **Target Users** | Kids demonstrating from a laptop browser; phone scanning for product selection |

---

## Functional Requirements

### FR-01: Vending Machine Display (Laptop View)

| ID | Requirement |
|---|---|
| FR-01.1 | The application SHALL display a 3D/animated vending machine UI in the browser |
| FR-01.2 | The vending machine SHALL contain 24 products arranged in a grid layout |
| FR-01.3 | Products SHALL be categorized into: Fruits, Chocolates, Snacks, and Drinks |
| FR-01.4 | Each product SHALL display an image and name |
| FR-01.5 | Products that are "sold out" SHALL appear greyed out on the laptop display |
| FR-01.6 | The vending machine SHALL display a single main QR code for phone scanning |
| FR-01.7 | The display SHALL update in real-time when products are picked via phone (no manual refresh) |

### FR-02: QR Code System

| ID | Requirement |
|---|---|
| FR-02.1 | The system SHALL generate a QR code displayed on the laptop vending machine page |
| FR-02.2 | Scanning the QR code with a phone camera SHALL open a mobile-friendly product catalog page |
| FR-02.3 | The QR code SHALL encode the URL to the current available products view |
| FR-02.4 | After a product is picked up, the QR code on the laptop SHALL refresh/regenerate to reflect only remaining available products |
| FR-02.5 | The QR refresh cycle SHALL repeat for all subsequent product pickups |

### FR-03: Phone/Mobile View (Product Catalog)

| ID | Requirement |
|---|---|
| FR-03.1 | The mobile view SHALL display all currently available products with images |
| FR-03.2 | Users SHALL be able to tap/select a product to "pick it up" |
| FR-03.3 | After picking a product, the mobile view SHALL update to show only remaining available products |
| FR-03.4 | Sold-out products SHALL appear greyed out on the mobile view |
| FR-03.5 | The mobile view SHALL be responsive and touch-friendly |

### FR-04: Real-Time Synchronization

| ID | Requirement |
|---|---|
| FR-04.1 | The system SHALL use WebSocket connections for real-time communication |
| FR-04.2 | When a product is picked on the phone, the laptop view SHALL update instantly |
| FR-04.3 | The QR code on the laptop SHALL regenerate after each product pickup |
| FR-04.4 | Multiple phones scanning the same QR SHALL see the same available products |

### FR-05: Auto-Reset (Demo Mode)

| ID | Requirement |
|---|---|
| FR-05.1 | The vending machine SHALL automatically reset/restock all products periodically |
| FR-05.2 | The reset interval SHALL be configurable (default: every 5 minutes) |
| FR-05.3 | On reset, all products SHALL become available again and the QR code SHALL regenerate |

### FR-06: Product Data

| ID | Requirement |
|---|---|
| FR-06.1 | The system SHALL include 24 products across 4 categories |
| FR-06.2 | **Fruits** (6 items): e.g., Apple, Banana, Orange, Grapes, Watermelon, Mango |
| FR-06.3 | **Chocolates** (6 items): e.g., Milk Chocolate, Dark Chocolate, White Chocolate, Hazelnut Bar, Caramel Bar, Mint Chocolate |
| FR-06.4 | **Snacks** (6 items): e.g., Potato Chips, Cookies, Popcorn, Pretzels, Granola Bar, Trail Mix |
| FR-06.5 | **Drinks** (6 items): e.g., Water, Orange Juice, Cola, Lemonade, Iced Tea, Milk |
| FR-06.6 | Each product SHALL have: id, name, category, image URL, and availability status |

---

## Non-Functional Requirements

### NFR-01: Performance

| ID | Requirement |
|---|---|
| NFR-01.1 | WebSocket message delivery latency SHALL be under 500ms |
| NFR-01.2 | Page load time SHALL be under 3 seconds on a standard broadband connection |
| NFR-01.3 | QR code regeneration SHALL complete within 1 second |

### NFR-02: Usability

| ID | Requirement |
|---|---|
| NFR-02.1 | The laptop UI SHALL be visually engaging with 3D/animated vending machine appearance |
| NFR-02.2 | The mobile UI SHALL work on any modern smartphone browser (iOS Safari, Android Chrome) |
| NFR-02.3 | No app installation SHALL be required — phone uses built-in camera and browser |
| NFR-02.4 | The interface SHALL be simple enough for kids to understand and demonstrate |

### NFR-03: Deployment & Infrastructure

| ID | Requirement |
|---|---|
| NFR-03.1 | The application SHALL be containerized using Docker |
| NFR-03.2 | Docker Compose SHALL orchestrate all services |
| NFR-03.3 | The application SHALL be deployed on AWS EC2 |
| NFR-03.4 | The application SHALL be publicly accessible over the internet |
| NFR-03.5 | HTTPS SHALL be used for secure access |
| NFR-03.6 | A CI/CD pipeline SHALL be proposed for automated deployment |

### NFR-04: Availability

| ID | Requirement |
|---|---|
| NFR-04.1 | Single-region deployment is acceptable (no cross-region DR) |
| NFR-04.2 | The application SHALL be available during demo sessions |
| NFR-04.3 | Auto-restart on container failure (Docker restart policy) |

### NFR-05: Security (Baseline)

| ID | Requirement |
|---|---|
| NFR-05.1 | All traffic SHALL use HTTPS (TLS 1.2+) |
| NFR-05.2 | HTTP security headers SHALL be configured (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) |
| NFR-05.3 | Input validation SHALL be applied to all API endpoints |
| NFR-05.4 | Rate limiting SHALL be configured on public-facing endpoints |
| NFR-05.5 | No hardcoded credentials in source code |
| NFR-05.6 | Docker images SHALL use pinned versions (no `latest` tags) |
| NFR-05.7 | Structured logging SHALL be implemented |

---

## Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend Framework | React (with Three.js/React Three Fiber for 3D) | Best ecosystem for 3D web UI + component-based architecture |
| Backend Framework | Node.js with Express | Excellent WebSocket support, JavaScript full-stack consistency |
| Real-Time Protocol | WebSocket (Socket.IO) | Proven library for real-time bidirectional communication |
| QR Code Generation | Server-side QR generation (qrcode library) | Dynamic QR that updates with available product state |
| Containerization | Docker + Docker Compose | Simple multi-service orchestration |
| Deployment Target | AWS EC2 (single instance, single region) | User has AWS account, publicly accessible |
| CI/CD | To be proposed (GitHub Actions recommended) | User requested AI-DLC propose a pipeline |
| PBT Framework | fast-check (JavaScript/TypeScript) | Per PBT-09, integrates with Jest/Vitest |

---

## Resiliency & Operations Decisions

| Decision | Choice | Rationale |
|---|---|---|
| DR Strategy | N/A (single-region, no cross-region DR) | Demo workload, acceptable risk |
| Change Management | Exempt | Demo/internal tooling — no formal process needed |
| Rollback | N/A | Demo project, simple redeploy if needed |
| Deployment Style | Direct (Docker Compose up) | Simple demo, no rolling/canary needed |
| Regional Topology | N/A (single EC2 instance) | Demo workload, single zone sufficient |
| Incident Response | N/A | Demo project |
| Resiliency Testing | N/A | Demo project |

---

## Constraints

- Must work on laptop browser (Chrome, Firefox, Safari) for the vending machine display
- Must work on phone browser (iOS Safari, Android Chrome) for QR scanning and product selection
- No native app installation required
- Kids should be able to demonstrate without technical setup
- Public internet accessibility required for phone scanning to work outside local network

---

## Out of Scope

- Payment processing
- User authentication/accounts
- Persistent database (in-memory state sufficient for demo)
- Multi-region deployment
- Complex monitoring/alerting infrastructure
- Production-grade HA/DR
