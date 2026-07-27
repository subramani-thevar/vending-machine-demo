# Build Instructions — Vending Machine Demo

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org or `nvm install 20` |
| npm | 10.x | Bundled with Node.js |
| Docker | 24.x | https://docs.docker.com/get-docker/ |
| Docker Compose | 2.x | Bundled with Docker Desktop |

## Local Development Build

```bash
# 1. Clone repository
git clone <repository-url>
cd vending-machine-demo

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env: set SERVER_HOST=localhost

# 4. TypeScript compile check
npm run typecheck

# 5. Start development server (backend + frontend with HMR)
npm run dev
```

**Development URLs:**
- Laptop view: http://localhost:5173
- Mobile view: http://localhost:5173/mobile
- API: http://localhost:3001/api/products
- Health: http://localhost:3001/health

## Production Build

```bash
# 1. Build client (Vite → dist/client/)
npm run build:client

# 2. Build server (TypeScript → dist/server/)
npm run build:server

# 3. Start production server
NODE_ENV=production npm start
```

## Docker Build

```bash
# 1. Build Docker image
docker build -t vending-machine-demo:latest .

# 2. Run standalone (without Nginx)
docker run -p 3001:3001 \
  -e SERVER_HOST=localhost \
  -e RESET_INTERVAL_MS=300000 \
  vending-machine-demo:latest

# 3. Full stack with Nginx + HTTPS
docker compose up -d --build
```

## Build Verification Checklist

- [ ] `npm install` completes without errors
- [ ] `npm run typecheck` passes (zero TypeScript errors)
- [ ] `npm run lint` passes (zero ESLint errors)
- [ ] `npm run build` completes successfully
- [ ] `npm start` starts server on port 3001
- [ ] `curl http://localhost:3001/health` returns `{"status":"healthy"}`
- [ ] `curl http://localhost:3001/api/products` returns 24 products
- [ ] Docker image builds successfully
- [ ] Docker health check passes
