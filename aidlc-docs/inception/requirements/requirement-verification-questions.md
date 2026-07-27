# Requirements Verification Questions

Please answer the following questions to help clarify the Vending Machine Demo requirements.
Answer each question by filling in the letter choice after the [Answer]: tag.

---

## Question 1
How many products should be displayed in the vending machine?

A) 6-8 products (small demo)

B) 10-15 products (medium demo)

C) 16-24 products (full vending machine feel)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2
What product categories should be included?

A) Fruits only (apples, bananas, oranges, grapes, etc.)

B) Snacks only (chips, cookies, candy bars, etc.)

C) Mix of Fruits, Chocolates, and Snacks

D) Mix of Fruits, Chocolates, Snacks, and Drinks

E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3
How should the QR code scanning work on the phone?

A) Phone scans a single QR code displayed on the laptop screen that opens a product catalog page

B) Each product in the vending machine has its own QR code — phone scans individual products

C) One main QR code on the vending machine page, and once scanned, phone shows all available products to pick from

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 4
What happens after a product is "picked up" (selected)?

A) The product disappears from the vending machine display on the laptop AND the phone shows updated catalog

B) The product shows as "sold out" (greyed out) on both laptop and phone

C) The product disappears from the phone catalog only, and a new QR code is generated for the remaining products

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 5
Should the vending machine state reset automatically?

A) Yes — reset every few minutes (demo mode, auto-refills)

B) Yes — reset when browser is refreshed

C) No — provide a manual "Restock" button to reset all products

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 6
How should the laptop display look?

A) A realistic vending machine image/UI with product images arranged in a grid (like a real vending machine)

B) A simple product catalog grid with images and names

C) A 3D or animated vending machine look

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 7
What technology preference for the frontend?

A) Plain HTML/CSS/JavaScript (simplest, no build tools needed)

B) React (modern, component-based)

C) Vue.js (lightweight, easy to learn)

D) No preference — choose whatever works best for this demo

E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 8
For the backend/server, what is your preference?

A) Node.js with Express (JavaScript/TypeScript)

B) Python with Flask or FastAPI

C) No preference — choose whatever works best

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 9
For Docker deployment, where will this be hosted publicly?

A) AWS EC2 or similar cloud VM (I have an account)

B) A home server/Raspberry Pi with port forwarding

C) A free/cheap cloud service (Railway, Render, Fly.io, etc.)

D) Just Docker Compose running locally accessible on home network

E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 10
Should the phone and laptop views update in real-time (live sync)?

A) Yes — when a product is picked on phone, the laptop vending machine updates instantly (WebSocket/real-time)

B) No — laptop page needs a manual refresh to see changes

C) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 11: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

C) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 12: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 13: Resiliency Extensions
Should the resiliency baseline be applied to this project?

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more than reliability)

C) Other (please describe after [Answer]: tag below)

[Answer]: 

---

**Instructions**: Please fill in your letter choice after each `[Answer]:` tag and let me know when you're done.
