# Infrastructure Design — Vending Machine Demo

## Infrastructure Overview

| Component | AWS Service | Configuration |
|---|---|---|
| Compute | EC2 (t3.small) | 2 vCPU, 2 GB RAM, Amazon Linux 2023 |
| Networking | VPC + Security Group | Public subnet, restricted ingress |
| TLS | Let's Encrypt (Certbot) | Auto-renewal, Nginx integration |
| Container Runtime | Docker + Docker Compose | Installed on EC2 |
| Reverse Proxy | Nginx (containerized) | TLS termination, static assets |
| Application | Node.js (containerized) | Express + Socket.IO |
| CI/CD | GitHub Actions | Build, test, deploy pipeline |
| DNS (optional) | Route 53 or external DNS | Point domain to EC2 elastic IP |

---

## AWS Resource Specification

### EC2 Instance

| Attribute | Value | Rationale |
|---|---|---|
| Instance Type | t3.small | 2 vCPU, 2GB RAM sufficient for demo (50 WebSocket connections) |
| AMI | Amazon Linux 2023 | AWS-optimized, Docker support, long-term support |
| Storage | 20 GB gp3 EBS | OS + Docker images + app code |
| Elastic IP | Yes | Static public IP for DNS/QR stability |
| Key Pair | SSH key | Admin access only |

### Security Group

| Rule | Direction | Protocol | Port | Source | Purpose |
|---|---|---|---|---|---|
| HTTP | Inbound | TCP | 80 | 0.0.0.0/0 | Public web (redirects to HTTPS) |
| HTTPS | Inbound | TCP | 443 | 0.0.0.0/0 | Public web + WebSocket (wss://) |
| SSH | Inbound | TCP | 22 | Admin IP/32 | Admin SSH access only |
| All | Outbound | All | All | 0.0.0.0/0 | Allow outbound (package updates, etc.) |

**SECURITY-07 Compliance:**
- No inbound `0.0.0.0/0` except ports 80/443 (public web server)
- SSH restricted to specific admin IP
- Default deny on all other inbound ports

### IAM Role (EC2 Instance Profile)

| Permission | Resource | Purpose |
|---|---|---|
| ecr:GetAuthorizationToken | * | Pull Docker images (if using ECR) |
| ecr:BatchGetImage | arn:aws:ecr:*:*:repository/vending-machine-demo | Pull specific image |
| logs:PutLogEvents | arn:aws:logs:*:*:log-group:/vending-machine/* | Future CloudWatch logging |

**SECURITY-06 Compliance:**
- Specific actions only (no wildcard actions)
- Scoped to specific resources (no wildcard resources except where required by API)
- Minimal permissions for demo operation

---

## Docker Architecture

### Dockerfile (Multi-Stage Build)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1
CMD ["node", "dist/server.js"]
```

**SECURITY-09 Compliance:**
- Non-root user (`appuser`)
- Multi-stage build (no dev dependencies in production)
- Pinned base image (`node:20-alpine`, not `latest`)
- Health check defined

### Docker Compose Configuration

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: vending-app
    expose:
      - "3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SERVER_HOST=${SERVER_HOST}
      - RESET_INTERVAL_MS=${RESET_INTERVAL_MS:-300000}
      - LOG_LEVEL=info
      - MAX_CONNECTIONS=100
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:1.25-alpine
    container_name: vending-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      app:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped
    networks:
      - app-network

  certbot:
    image: certbot/certbot:v2.7.0
    container_name: vending-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## Nginx Configuration

### Main Configuration Highlights

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name ${SERVER_HOST};
    
    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    server_name ${SERVER_HOST};
    
    # TLS configuration
    ssl_certificate /etc/letsencrypt/live/${SERVER_HOST}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SERVER_HOST}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://app:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://app:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Request-ID $request_id;
    }
    
    # Health check
    location /health {
        proxy_pass http://app:3001;
    }
    
    # Static assets (React build served by app)
    location / {
        proxy_pass http://app:3001;
        proxy_set_header Host $host;
    }
}
```

---

## CI/CD Pipeline (GitHub Actions)

### Pipeline Stages

```
Push to main
    |
    v
[Install & Build]
    - npm ci
    - npm run build (TypeScript compile)
    |
    v
[Quality Checks]
    - npm run lint (ESLint)
    - npm audit (vulnerability scan)
    |
    v
[Test]
    - npm test (Vitest + fast-check)
    - Log PBT seed on every run
    |
    v
[Docker Build]
    - docker build -t vending-machine-demo:$SHA .
    - docker tag vending-machine-demo:$SHA vending-machine-demo:latest
    |
    v
[Deploy to EC2]
    - SSH to EC2
    - docker-compose pull (if using registry)
    - OR: scp + docker-compose build
    - docker-compose up -d
    - Verify health check responds
```

### GitHub Actions Workflow Structure

| Job | Steps | Secrets Needed |
|---|---|---|
| build-and-test | npm ci, build, lint, audit, test | None |
| deploy | SSH to EC2, docker-compose up | `EC2_SSH_KEY`, `EC2_HOST`, `EC2_USER` |

### Deployment Method
- **Simple approach** (recommended for demo): `rsync` code to EC2, `docker-compose build && docker-compose up -d`
- **Alternative**: Push to Docker Hub/ECR, pull on EC2
- **Trigger**: Push to `main` branch

---

## Initial Setup Script (EC2)

```bash
#!/bin/bash
# Run once on fresh EC2 instance

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Certbot dependencies
# (Certbot runs in container, no host install needed)

# Clone/copy project
# git clone <repo> /home/ec2-user/vending-machine-demo

# Initial TLS certificate
# docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d $SERVER_HOST
```

---

## Cost Estimate (Monthly)

| Resource | Cost | Notes |
|---|---|---|
| EC2 t3.small | ~$15/month | On-demand pricing, us-east-1 |
| EBS 20GB gp3 | ~$1.60/month | Storage |
| Elastic IP | $0 (attached) | Free when attached to running instance |
| Data Transfer | ~$1-5/month | Depends on demo usage |
| **Total** | **~$18-22/month** | Minimal cost for demo |

**Cost Optimization Options:**
- Use t3.micro ($7/month) if traffic is very low
- Use EC2 Savings Plan or Reserved Instance for lower rate
- Stop instance when not in use (elastic IP charges $3.60/month if unattached)
