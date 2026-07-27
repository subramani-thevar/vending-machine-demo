# Vending Machine Demo

Interactive 3D vending machine with QR code scanning and real-time product tracking.

## Features

- 🏪 **3D Vending Machine** — React Three Fiber powered visual display on laptop
- 📱 **QR Code Scanning** — Scan with phone to browse and pick products
- ⚡ **Real-Time Sync** — WebSocket powered instant updates across all devices
- 🔄 **Auto-Reset** — Products restock automatically after configurable interval
- 🐳 **Docker Deployment** — Docker Compose with Nginx reverse proxy and HTTPS

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Create .env from template
cp .env.example .env

# Start development (server + client with hot reload)
npm run dev
```

- Laptop view: http://localhost:5173
- Mobile view: http://localhost:5173/mobile

## Production Deployment (Docker)

```bash
# Set environment
export SERVER_HOST=your-domain.com

# Build and start
docker compose up -d --build

# Check health
curl http://localhost/health
```

## Architecture

```
Laptop Browser (3D) ←→ Nginx (HTTPS) ←→ Node.js (Express + Socket.IO) ←→ Phone Browser (Mobile)
```

- **Frontend**: React 18, React Three Fiber, Tailwind CSS
- **Backend**: Node.js 20, Express, Socket.IO, Zod
- **Testing**: Vitest, fast-check (property-based testing)
- **Infrastructure**: Docker, Nginx, Let's Encrypt, GitHub Actions

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SERVER_HOST` | localhost | Public domain/IP for QR code URL |
| `RESET_INTERVAL_MS` | 300000 | Auto-reset interval (ms, default 5 min) |
| `PORT` | 3001 | Internal server port |
| `LOG_LEVEL` | info | Logging level |
| `MAX_CONNECTIONS` | 100 | Max WebSocket connections |

## Testing

```bash
# Run all tests (unit + property-based)
npm test

# Run with specific seed (reproducibility)
VITEST_SEED=12345 npm test
```

## Project Structure

```
src/
├── server/          # Node.js backend
│   ├── services/    # Business logic (Product, QR, Timer, WebSocket)
│   ├── routes/      # REST API endpoints
│   ├── middleware/  # Express middleware (auth, validation, rate limiting)
│   └── data/        # Product seed data
└── client/          # React frontend
    ├── laptop/      # 3D vending machine view
    ├── mobile/      # Phone product catalog
    └── hooks/       # Shared React hooks (WebSocket, API)
```

## License

MIT
