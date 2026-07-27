# Deployment Architecture — Vending Machine Demo

## Architecture Diagram

```
+----------------------------------------------------------+
|                      INTERNET                            |
+----------------------------------------------------------+
                           |
                           | HTTPS (443) + HTTP (80)
                           v
+----------------------------------------------------------+
|                   AWS EC2 (t3.small)                      |
|  Region: us-east-1 | AZ: single                         |
|  OS: Amazon Linux 2023                                   |
|  Elastic IP: xxx.xxx.xxx.xxx                             |
|----------------------------------------------------------|
|                                                          |
|  Security Group: vending-machine-sg                      |
|  Inbound: 80/tcp (0.0.0.0/0), 443/tcp (0.0.0.0/0)     |
|           22/tcp (admin-ip/32)                           |
|  Outbound: All (0.0.0.0/0)                              |
|                                                          |
|  +----------------------------------------------------+  |
|  |            Docker Compose Network                  |  |
|  |            (bridge: app-network)                   |  |
|  |                                                    |  |
|  |  +--------------------+  +---------------------+  |  |
|  |  | nginx:1.25-alpine  |  | certbot:v2.7.0     |  |  |
|  |  | Port 80, 443       |  | TLS cert renewal   |  |  |
|  |  | (public-facing)    |  | (runs every 12h)   |  |  |
|  |  +--------+-----------+  +---------------------+  |  |
|  |           |                                        |  |
|  |           | proxy_pass (port 3001)                 |  |
|  |           v                                        |  |
|  |  +--------------------------------------------+   |  |
|  |  | node:20-alpine                             |   |  |
|  |  | vending-machine-demo app                   |   |  |
|  |  | Port 3001 (internal only)                  |   |  |
|  |  |                                            |   |  |
|  |  | Express + Socket.IO + React Build          |   |  |
|  |  | In-memory state (no external deps)         |   |  |
|  |  +--------------------------------------------+   |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

---

## Network Flow

### HTTPS Request Flow (REST API)
```
Client Browser
    → DNS resolves to Elastic IP
    → TCP connection to port 443
    → TLS handshake (Nginx, Let's Encrypt cert)
    → HTTP/1.1 request
    → Nginx matches location (/api/*)
    → Proxy pass to app:3001
    → Express processes request
    → Response back through Nginx to client
```

### WebSocket Connection Flow
```
Client Browser
    → HTTPS connection to /socket.io/
    → Nginx detects Upgrade header
    → Proxy WebSocket to app:3001/socket.io/
    → Socket.IO handshake (HTTP upgrade to WS)
    → Bidirectional WebSocket established
    → Messages flow directly through Nginx proxy
```

### TLS Certificate Flow
```
Initial Setup:
    → Nginx serves HTTP on port 80
    → Certbot creates ACME challenge at /.well-known/acme-challenge/
    → Let's Encrypt validates domain ownership
    → Certificate issued to /etc/letsencrypt/
    → Nginx reloads with TLS configuration

Renewal (every 12 hours check):
    → Certbot container wakes up
    → Checks certificate expiry (renews if < 30 days)
    → If renewed: Nginx picks up new cert on next reload
```

---

## Deployment Process

### Initial Deployment

```bash
# 1. Launch EC2 instance (Amazon Linux 2023, t3.small)
# 2. Attach Elastic IP
# 3. Configure Security Group
# 4. SSH into instance

# 5. Install Docker & Docker Compose
sudo yum update -y && sudo yum install -y docker git
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ec2-user
# Log out and back in for group change

# 6. Install Docker Compose v2
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# 7. Clone repository
git clone https://github.com/<user>/vending-machine-demo.git
cd vending-machine-demo

# 8. Create .env file
echo "SERVER_HOST=your-domain.com" > .env
echo "RESET_INTERVAL_MS=300000" >> .env

# 9. Get initial TLS certificate (HTTP-only first)
docker compose up -d nginx  # Start Nginx for ACME challenge
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d your-domain.com --agree-tos --email your@email.com

# 10. Start full stack
docker compose up -d

# 11. Verify
curl -f https://your-domain.com/health
```

### Update Deployment (CI/CD triggered)

```bash
# SSH to EC2 (via GitHub Actions)
cd /home/ec2-user/vending-machine-demo
git pull origin main
docker compose build app
docker compose up -d app
# Nginx stays running (zero-downtime for TLS)
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SERVER_HOST` | Yes | — | Public domain/IP for QR URL generation |
| `RESET_INTERVAL_MS` | No | 300000 | Auto-reset timer (ms) |
| `NODE_ENV` | No | production | Runtime environment |
| `PORT` | No | 3001 | Internal app port |
| `LOG_LEVEL` | No | info | Logging verbosity |
| `MAX_CONNECTIONS` | No | 100 | Max WebSocket connections |

---

## Monitoring & Operations

### Health Monitoring
- Docker health checks: restart unhealthy containers automatically
- `GET /health` endpoint: uptime, connection count, memory usage
- Docker logs: `docker compose logs -f app` for real-time monitoring

### Log Access
```bash
# View app logs
docker compose logs -f app

# View nginx access logs
docker compose logs -f nginx

# Export logs (last 24h)
docker compose logs --since 24h app > app-logs.txt
```

### Troubleshooting
```bash
# Check container status
docker compose ps

# Restart app only (preserves Nginx/TLS)
docker compose restart app

# Full restart
docker compose down && docker compose up -d

# Check resource usage
docker stats
```

---

## Security Checklist (Pre-Deployment)

- [ ] SSH key pair generated (not default)
- [ ] Security group restricts SSH to admin IP only
- [ ] `.env` file not committed to git (in .gitignore)
- [ ] `SERVER_HOST` set to actual public domain
- [ ] TLS certificate obtained and valid
- [ ] No `latest` tags in docker-compose.yml
- [ ] Docker images built from pinned base images
- [ ] EC2 instance has IAM role (not root keys)
- [ ] `docker compose` runs as non-root user on host
- [ ] App container runs as non-root user (appuser)
