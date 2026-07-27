# User Personas — Vending Machine Demo

---

## Persona 1: Demo Presenter (Primary)

| Attribute | Detail |
|---|---|
| **Name** | Sam (age 10) |
| **Role** | Kid demonstrating the vending machine on their laptop |
| **Device** | Laptop with modern browser (Chrome/Firefox/Safari) |
| **Goals** | Show friends/family the cool 3D vending machine, demonstrate how scanning works, present a polished interactive demo |
| **Frustrations** | If things don't work immediately, if setup is complicated, if the visual isn't impressive |
| **Tech Comfort** | Can open a browser and navigate to a URL; doesn't know terminal commands |
| **Context** | Opens the vending machine page on laptop, shows it to audience, invites someone to scan the QR with their phone |

### Key Needs
- Visually impressive 3D vending machine that loads quickly
- Clear QR code visible on screen for phone scanning
- Instant visual feedback when products are picked (greyed out in real-time)
- Auto-reset so the demo can be shown repeatedly without manual intervention
- No login, no setup — just open the URL and it works

---

## Persona 2: Product Picker

| Attribute | Detail |
|---|---|
| **Name** | Parent/Friend/Sibling |
| **Role** | Person using their phone to scan the QR code and pick products |
| **Device** | Smartphone (iOS or Android) with built-in camera |
| **Goals** | Scan the QR code, see available products, pick a product, see the vending machine update |
| **Frustrations** | If QR doesn't scan easily, if mobile page isn't touch-friendly, if there's lag between picking and seeing the update |
| **Tech Comfort** | Familiar with phone cameras and web browsers; no app installation |
| **Context** | Points phone camera at laptop screen QR code, opens the link, browses products, taps to pick |

### Key Needs
- QR code scannable with standard phone camera (no special app needed)
- Mobile-optimized page that loads fast and is easy to tap
- Clear product images with obvious tap-to-pick interaction
- Immediate feedback after picking (product greys out, confirmation shown)
- Updated product list after each pick (refreshed QR shows remaining)

---

## Persona 3: Audience/Observer

| Attribute | Detail |
|---|---|
| **Name** | Classmates, family members, teachers |
| **Role** | People watching the demo on the laptop screen |
| **Device** | None (watching the laptop) |
| **Goals** | Understand what's happening, be impressed by the interaction, see products disappear in real-time |
| **Frustrations** | If the UI is confusing, if updates aren't visible, if they can't tell what the demo does |
| **Tech Comfort** | Passive observer — no interaction required |
| **Context** | Watches the laptop screen while someone else scans and picks products from their phone |

### Key Needs
- Visually clear 3D vending machine that's easy to understand at a glance
- Obvious visual change when a product is picked (greyed out with animation)
- Product categories are visually distinguishable
- QR code is clearly visible and labeled ("Scan me!")
- The demo loop is self-explanatory without verbal explanation

---

## Persona Interaction Map

```
+------------------+     scans QR      +------------------+
| Demo Presenter   | ----------------> | Product Picker   |
| (Laptop Browser) |                   | (Phone Browser)  |
+------------------+                   +------------------+
        |                                       |
        | shows to                              | picks product
        v                                       v
+------------------+     watches        +------------------+
| Audience         | <----- real-time --| Backend Server   |
| (Observers)      |     update on      | (WebSocket Hub)  |
+------------------+     laptop screen  +------------------+
```

---

## Cross-Persona Interactions

| Interaction | Personas Involved | Description |
|---|---|---|
| QR Display → Scan | Presenter → Picker | Presenter's laptop shows QR, Picker scans with phone |
| Product Pick → Visual Update | Picker → Presenter + Audience | Picker taps product, all laptop viewers see it grey out instantly |
| Auto-Reset → New Demo Round | System → All | After timer, all products restore, new demo round begins |
| QR Regeneration → New Scan | System → Picker | After pick, QR refreshes so Picker can scan again for remaining products |
