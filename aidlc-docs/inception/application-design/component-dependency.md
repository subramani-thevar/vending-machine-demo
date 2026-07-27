# Component Dependencies — Vending Machine Demo

## Dependency Matrix

| Component | Depends On | Depended On By |
|---|---|---|
| VendingMachineUI | APIServer, WebSocketHub | — |
| MobileCatalogUI | APIServer, WebSocketHub | — |
| APIServer | ProductService, QRService | VendingMachineUI, MobileCatalogUI |
| WebSocketHub | ProductService, QRService, TimerService | VendingMachineUI, MobileCatalogUI |
| ProductService | Product config data | APIServer, WebSocketHub, QRService, TimerService |
| QRService | ProductService (events), Server config | APIServer, WebSocketHub |
| TimerService | ProductService, Config | WebSocketHub |
| DockerOrchestrator | App container, Nginx config | All (infrastructure layer) |

---

## Communication Patterns

### HTTP (REST)
```
VendingMachineUI  --HTTP GET-->  Nginx  --proxy-->  APIServer
MobileCatalogUI   --HTTP GET/POST-->  Nginx  --proxy-->  APIServer
```

### WebSocket
```
VendingMachineUI  --WS-->  Nginx (upgrade)  --WS-->  WebSocketHub
MobileCatalogUI   --WS-->  Nginx (upgrade)  --WS-->  WebSocketHub
```

### Internal Events (Node.js EventEmitter)
```
ProductService  --"product:picked"-->  QRService, TimerService, WebSocketHub
ProductService  --"products:reset"-->  QRService, WebSocketHub
QRService       --"qr:updated"-->      WebSocketHub
TimerService    --"timer:tick"-->       WebSocketHub
TimerService    --"timer:expired"-->    ProductService
```

---

## Data Flow Diagram

```
+============================================+
|           BROWSER CLIENTS                  |
+============================================+
|                                            |
|  +------------------+  +----------------+  |
|  | Laptop Browser   |  | Phone Browser  |  |
|  | (React + R3F)    |  | (React Mobile) |  |
|  +--------+---------+  +-------+--------+  |
|           |                     |          |
+===========|=====================|==========+
            | HTTPS + WSS         | HTTPS + WSS
            v                     v
+===========|=====================|==========+
|           INFRASTRUCTURE                   |
+============================================+
|                                            |
|  +----------------------------------------+|
|  |         Nginx Reverse Proxy            ||
|  |  - TLS termination (Let's Encrypt)     ||
|  |  - Security headers                    ||
|  |  - WebSocket upgrade support           ||
|  |  - Static asset serving (optional)     ||
|  +-------------------+--------------------+|
|                      |                     |
+============================================+
                       | HTTP + WS (internal)
                       v
+============================================+
|           APPLICATION SERVER               |
+============================================+
|                                            |
|  +----------------------------------------+|
|  |    Express + Socket.IO (port 3001)     ||
|  +----+------------------+----------------+|
|       |                  |                 |
|  +----v------+    +------v---------+       |
|  | REST      |    | WebSocket      |       |
|  | Router    |    | Handler        |       |
|  +----+------+    +------+---------+       |
|       |                  |                 |
|  +----v------------------v---------+       |
|  |        SERVICE LAYER            |       |
|  |                                  |       |
|  |  +------------+  +-----------+  |       |
|  |  | Product    |  | QR        |  |       |
|  |  | Service    |<>| Service   |  |       |
|  |  +-----+------+  +-----------+  |       |
|  |        |                         |       |
|  |  +-----v------+                  |       |
|  |  | Timer      |                  |       |
|  |  | Service    |                  |       |
|  |  +------------+                  |       |
|  +----------------------------------+       |
|                                            |
|  +----------------------------------------+|
|  |    In-Memory State                     ||
|  |    (Map<productId, Product>)           ||
|  +----------------------------------------+|
|                                            |
+============================================+
```

---

## Coupling Analysis

| Relationship | Coupling Level | Justification |
|---|---|---|
| Frontend → Backend | Loose | REST API + WebSocket event contracts (can swap frontend independently) |
| APIServer → ProductService | Moderate | Direct method calls, same process |
| WebSocketHub → Services | Moderate | Event-based listening + direct calls for sync |
| ProductService → QRService | Loose | Event-driven (ProductService doesn't know about QRService) |
| TimerService → ProductService | Moderate | Direct call to resetAll() on timer expiry |
| Nginx → App | Loose | HTTP proxy, easily reconfigurable |

---

## Deployment Topology

```
+----------------------------------------------+
|              AWS EC2 Instance                 |
|                                              |
|  +----------------------------------------+  |
|  |         Docker Compose                 |  |
|  |                                        |  |
|  |  +----------------------------------+  |  |
|  |  | nginx:alpine                     |  |  |
|  |  | Port 80 (HTTP → redirect)        |  |  |
|  |  | Port 443 (HTTPS + WSS)           |  |  |
|  |  +----------------+-----------------+  |  |
|  |                   |                    |  |
|  |                   v                    |  |
|  |  +----------------------------------+  |  |
|  |  | node:20-alpine                   |  |  |
|  |  | App Server (port 3001 internal)  |  |  |
|  |  | Express + Socket.IO              |  |  |
|  |  | Serves React build (static)      |  |  |
|  |  +----------------------------------+  |  |
|  |                                        |  |
|  +----------------------------------------+  |
|                                              |
+----------------------------------------------+
```

**Network:**
- EC2 Security Group: Inbound 80, 443 from 0.0.0.0/0 (public web)
- EC2 Security Group: Inbound 22 from admin IP only (SSH)
- Internal Docker network: nginx → app on port 3001
- No database, no external service dependencies
