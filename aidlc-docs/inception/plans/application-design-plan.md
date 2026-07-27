# Application Design Plan — Vending Machine Demo

## Plan Overview
Define high-level components, their interfaces, service layer, and dependencies for the Vending Machine Demo.

---

## Clarification Questions

### Question 1: Frontend-Backend Communication Pattern
How should the frontend communicate with the backend for non-real-time operations (initial page load, product data)?

A) REST API — standard HTTP endpoints for fetching product list, separate WebSocket for real-time updates

B) WebSocket only — all communication through WebSocket (including initial data load)

C) GraphQL — query-based API for product data, WebSocket subscription for real-time

D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: State Persistence
Where should product availability state be stored?

A) In-memory only (server process memory) — simplest, state lost on restart, appropriate for demo

B) Redis — in-memory store with optional persistence, supports multiple server instances

C) SQLite — lightweight file-based database, state survives restart

D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: 3D Framework Approach
For the 3D vending machine UI, which rendering approach?

A) React Three Fiber (R3F) — React wrapper around Three.js, component-based 3D scene

B) Plain Three.js — direct Three.js with React for the rest of the page

C) CSS 3D transforms — pseudo-3D using CSS perspective and transforms (lighter, no WebGL required)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Design Execution Steps

- [x] Step 1: Define system components and boundaries
  - [x] Frontend (React + 3D) component
  - [x] Backend API (Express) component
  - [x] WebSocket Server (Socket.IO) component
  - [x] QR Code Generator component
  - [x] Product State Manager component
  - [x] Auto-Reset Timer component

- [x] Step 2: Define component interfaces (method signatures)
  - [x] REST API endpoints
  - [x] WebSocket event contracts
  - [x] Internal service interfaces

- [x] Step 3: Define service layer
  - [x] ProductService (state management)
  - [x] QRService (QR generation/regeneration)
  - [x] TimerService (auto-reset scheduling)
  - [x] WebSocketService (real-time broadcast)

- [x] Step 4: Define component dependencies and data flow
  - [x] Dependency matrix
  - [x] Data flow diagram
  - [x] Communication patterns

- [x] Step 5: Create consolidated application design document

---

**Instructions**: Please fill in your answers after each `[Answer]:` tag and let me know when you're done.
