# User Stories — Vending Machine Demo

**Organization**: User Journey-Based (scan → browse → pick → update → repeat)
**Acceptance Criteria Level**: High (edge cases and validation rules specified)

---

## Epic 1: Vending Machine Display (Laptop View)

### Story 1.1: View 3D Vending Machine
**As a** Demo Presenter,
**I want to** see a 3D animated vending machine in my browser,
**So that** I can impress my audience with a visually engaging demo.

**Acceptance Criteria:**
- GIVEN the user navigates to the application URL
- WHEN the page loads
- THEN a 3D vending machine is rendered with:
  - Smooth loading animation (no jarring pop-in)
  - Page fully renders within 3 seconds on standard broadband
  - Glass panel effect showing products inside
  - Responsive layout that fills the screen appropriately
  - Works on Chrome, Firefox, and Safari (latest 2 versions)
- AND if WebGL is not supported, a graceful fallback 2D grid is displayed with a message

### Story 1.2: View Products in Vending Machine
**As a** Demo Presenter,
**I want to** see 24 products arranged in the vending machine grid,
**So that** the demo looks like a real vending machine with variety.

**Acceptance Criteria:**
- GIVEN the vending machine has loaded
- WHEN I look at the product display
- THEN I see 24 products arranged in a grid (4 columns × 6 rows)
- AND each product shows:
  - Product image (minimum 64×64px, clear at display size)
  - Product name (readable text, no truncation)
  - Category color indicator (distinct color per category)
- AND products are grouped by category:
  - Row 1-2: Fruits (6 items, green indicator)
  - Row 2-3: Chocolates (6 items, brown indicator)
  - Row 4-5: Snacks (6 items, orange indicator)
  - Row 5-6: Drinks (6 items, blue indicator)

### Story 1.3: View QR Code on Vending Machine
**As a** Demo Presenter,
**I want to** see a clearly visible QR code on the vending machine display,
**So that** my audience knows they can scan it to interact.

**Acceptance Criteria:**
- GIVEN the vending machine page is loaded
- WHEN I look at the QR code area
- THEN a QR code is displayed with:
  - Minimum size of 200×200px (scannable from 30cm away from laptop screen)
  - High contrast (black on white background)
  - Clear label text: "Scan me to pick a product!" or similar
  - QR encodes the URL to the mobile product catalog
  - QR is positioned prominently (not hidden or small)
- AND the QR code is valid and scannable by standard phone cameras (iOS/Android)
- AND if the server URL changes, the QR automatically reflects the correct URL

### Story 1.4: See Sold-Out Products
**As a** Demo Presenter,
**I want to** see products visually change to "sold out" when picked,
**So that** my audience can see the real-time interaction working.

**Acceptance Criteria:**
- GIVEN a product has been picked via the phone
- WHEN the WebSocket update arrives
- THEN the product in the vending machine:
  - Transitions to greyed-out state with a smooth animation (200-500ms)
  - Shows reduced opacity (50% or lower)
  - Displays a "SOLD OUT" overlay or badge
  - Remains in its grid position (doesn't shift layout)
- AND the update appears within 500ms of the pick action
- AND no page refresh is required

---

## Epic 2: QR Code Scanning System

### Story 2.1: Scan QR Code with Phone
**As a** Product Picker,
**I want to** scan the QR code on the laptop screen using my phone camera,
**So that** I can access the product catalog without typing a URL.

**Acceptance Criteria:**
- GIVEN the QR code is displayed on the laptop screen
- WHEN I point my phone camera at the QR code
- THEN my phone's built-in QR scanner detects it:
  - iOS: Camera app recognizes the QR and shows a link banner
  - Android: Google Lens or built-in camera QR detection recognizes it
  - No third-party app installation required
- AND tapping the link opens the mobile product catalog in the phone's browser
- AND the URL uses HTTPS for secure access
- AND the page loads within 3 seconds on 4G/WiFi

### Story 2.2: QR Code Regenerates After Product Pick
**As a** Product Picker,
**I want** the QR code to refresh after I pick a product,
**So that** I (or someone else) can scan again to see only the remaining available products.

**Acceptance Criteria:**
- GIVEN I have just picked a product from the mobile catalog
- WHEN the pick is confirmed
- THEN the QR code on the laptop screen:
  - Regenerates within 1 second
  - Encodes an updated URL reflecting current available product state
  - Shows a brief visual pulse/animation to indicate it changed
- AND scanning the new QR code opens a catalog showing only available products
- AND previously picked (sold-out) products appear greyed out in the new catalog
- AND the old QR URL still works but shows the updated state (not a broken link)

### Story 2.3: QR Code Shows Server URL
**As a** Product Picker,
**I want** the QR code to point to a publicly accessible URL,
**So that** I can scan it from my phone on any network (not just local).

**Acceptance Criteria:**
- GIVEN the application is deployed on AWS EC2
- WHEN the QR code is generated
- THEN it encodes the public server URL (not localhost or private IP)
- AND the URL is accessible from any device with internet access
- AND HTTPS is used (valid certificate, no browser warnings)

---

## Epic 3: Mobile Product Selection

### Story 3.1: Browse Available Products on Phone
**As a** Product Picker,
**I want to** see all available products on my phone after scanning the QR,
**So that** I can choose which product to pick.

**Acceptance Criteria:**
- GIVEN I have scanned the QR code and opened the mobile catalog
- WHEN the page loads
- THEN I see a mobile-optimized product grid with:
  - Product images (clear, high-quality, tap-friendly size minimum 80×80px)
  - Product names visible below each image
  - Category grouping or filtering (Fruits, Chocolates, Snacks, Drinks)
  - Available products in full color
  - Sold-out products greyed out with "Sold Out" label
- AND the page is responsive (works on screens 320px to 428px wide)
- AND touch targets are at least 44×44px (iOS Human Interface Guidelines)
- AND the page loads within 3 seconds

### Story 3.2: Pick a Product from Phone
**As a** Product Picker,
**I want to** tap on a product to pick it up,
**So that** I can simulate taking a product from the vending machine.

**Acceptance Criteria:**
- GIVEN I am viewing available products on my phone
- WHEN I tap on an available product
- THEN:
  - A confirmation animation plays (e.g., product "flies out" or checkmark appears)
  - The product transitions to greyed-out/sold-out state on my phone
  - A success message appears briefly ("You picked [Product Name]!")
  - The product cannot be tapped again (disabled state)
- AND tapping a sold-out product does nothing (no error, no action)
- AND the action is irreversible within the current session
- AND the pick is sent to the server within 200ms of tap

### Story 3.3: See Updated Catalog After Pick
**As a** Product Picker,
**I want to** see the remaining available products after my pick,
**So that** I know what's still available if I want to pick another.

**Acceptance Criteria:**
- GIVEN I have just picked a product
- WHEN the pick confirmation completes
- THEN my mobile catalog updates to show:
  - The picked product is now greyed out
  - All other available products remain selectable
  - Product count or availability indicator updates
- AND if someone else picks a product simultaneously, my view updates in real-time
- AND the catalog remains functional without needing to re-scan the QR

---

## Epic 4: Real-Time Synchronization

### Story 4.1: Laptop Updates When Phone Picks Product
**As a** Demo Presenter,
**I want** the laptop vending machine to update instantly when a product is picked on the phone,
**So that** my audience sees the real-time interaction without refreshing.

**Acceptance Criteria:**
- GIVEN the laptop vending machine is displayed and a phone is connected
- WHEN a product is picked on the phone
- THEN the laptop display:
  - Shows the product transitioning to sold-out within 500ms
  - Plays a smooth greying-out animation
  - QR code regenerates within 1 second
- AND no page refresh is required on the laptop
- AND the WebSocket connection auto-reconnects if temporarily lost (retry within 3 seconds)
- AND if WebSocket disconnects, a subtle "Reconnecting..." indicator appears

### Story 4.2: Multiple Phones See Same State
**As a** Product Picker,
**I want** all phones that have scanned the QR to see the same product availability,
**So that** two people don't try to pick the same product.

**Acceptance Criteria:**
- GIVEN multiple phones have scanned the QR code
- WHEN one phone picks a product
- THEN all other connected phones:
  - See that product transition to sold-out within 500ms
  - Cannot tap that product anymore
- AND the state is consistent across all connected clients
- AND race conditions are handled (if two phones tap the same product simultaneously, only the first succeeds)
- AND the second phone sees a "Already picked!" message (not an error)

### Story 4.3: Handle Connection Loss Gracefully
**As a** Product Picker,
**I want** the app to handle network interruptions gracefully,
**So that** the demo doesn't break if WiFi drops momentarily.

**Acceptance Criteria:**
- GIVEN I am viewing products on my phone
- WHEN the WebSocket connection drops
- THEN:
  - A subtle "Connection lost" indicator appears (not a blocking modal)
  - The app attempts reconnection automatically every 3 seconds
  - When reconnected, the product state syncs to current server state
  - Any picks I attempted while offline are discarded (with brief notification)
- AND the same behavior applies to the laptop view
- AND reconnection attempt limit: 10 attempts, then show "Please refresh" message

---

## Epic 5: Demo Mode (Auto-Reset)

### Story 5.1: Automatic Restock Timer
**As a** Demo Presenter,
**I want** the vending machine to automatically restock all products after a few minutes,
**So that** I can run the demo again without manual intervention.

**Acceptance Criteria:**
- GIVEN products have been picked (some or all are sold out)
- WHEN the auto-reset timer expires (default: 5 minutes)
- THEN:
  - All products transition back to available state
  - A visual "Restocking!" animation plays on the laptop (e.g., products sliding back in)
  - The QR code regenerates showing all products available
  - All connected phones receive updated state (all products available)
  - The timer resets and begins counting down again
- AND the timer starts from the last product pick (not from page load)
- AND the reset interval is configurable via environment variable (RESET_INTERVAL_MS)

### Story 5.2: Visual Reset Countdown (Optional Enhancement)
**As a** Demo Presenter,
**I want to** see how much time until the next restock,
**So that** I know when the demo will reset.

**Acceptance Criteria:**
- GIVEN products have been picked
- WHEN I look at the vending machine display
- THEN a subtle countdown timer or progress bar shows time until reset:
  - Positioned in a non-intrusive location (bottom corner or top bar)
  - Shows minutes:seconds format
  - Final 30 seconds: timer pulses or changes color to indicate imminent reset
- AND the countdown is visible only on the laptop view (not mobile)

### Story 5.3: All Products Picked Scenario
**As a** Demo Presenter,
**I want** the demo to handle the case where all 24 products are picked,
**So that** the demo gracefully handles the "empty machine" state.

**Acceptance Criteria:**
- GIVEN all 24 products have been picked
- WHEN the last product is picked
- THEN:
  - The vending machine shows an "All Sold Out!" message with animation
  - The QR code shows "All products sold! Restocking soon..."
  - The mobile catalog shows "All products have been picked! Restocking in X:XX"
  - The auto-reset timer continues normally (restock at next interval)
- AND if the reset timer is close (under 1 minute), show "Restocking shortly!" instead

---

## Story Priority Matrix

| Priority | Stories | Rationale |
|---|---|---|
| P0 (Must Have) | 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 4.1, 5.1 | Core demo functionality |
| P1 (Should Have) | 2.3, 3.3, 4.2, 4.3, 5.3 | Robustness and multi-user support |
| P2 (Nice to Have) | 5.2 | Polish and enhancement |

---

## Persona-Story Mapping

| Story | Primary Persona | Secondary Persona |
|---|---|---|
| 1.1 View 3D Machine | Demo Presenter | Audience |
| 1.2 View Products | Demo Presenter | Audience |
| 1.3 View QR Code | Demo Presenter | Product Picker |
| 1.4 See Sold-Out | Demo Presenter | Audience |
| 2.1 Scan QR | Product Picker | — |
| 2.2 QR Regenerates | Product Picker | Demo Presenter |
| 2.3 QR Public URL | Product Picker | — |
| 3.1 Browse Products | Product Picker | — |
| 3.2 Pick Product | Product Picker | — |
| 3.3 Updated Catalog | Product Picker | — |
| 4.1 Laptop Real-Time | Demo Presenter | Audience |
| 4.2 Multi-Phone Sync | Product Picker | Product Picker |
| 4.3 Connection Loss | Product Picker | Demo Presenter |
| 5.1 Auto-Reset | Demo Presenter | Product Picker |
| 5.2 Reset Countdown | Demo Presenter | Audience |
| 5.3 All Picked | Demo Presenter | Audience |

---

## INVEST Criteria Verification

| Criterion | Status | Evidence |
|---|---|---|
| **Independent** | ✅ | Each story can be developed and tested in isolation |
| **Negotiable** | ✅ | Stories describe desired outcomes, not implementation details |
| **Valuable** | ✅ | Each story delivers visible user value or system robustness |
| **Estimable** | ✅ | Detailed acceptance criteria make estimation straightforward |
| **Small** | ✅ | Stories are scoped to single interaction points |
| **Testable** | ✅ | GIVEN/WHEN/THEN format with measurable criteria |
