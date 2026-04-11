# DevOps Handoff - Masik Chada

This handoff provides the deployment baseline for `subscription.mymentech.com` using Docker Compose and Nginx reverse proxy.

## Delivered Artifacts

- `docker-compose.yml`
- `backend/Dockerfile`
- `backend/.env.example`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `nginx/default.conf`

## Service Topology

- `masik_db` (`mongo:7`), internal only, data persisted at `./dbdata`.
- `masik_backend` (Node 20 Alpine image build), depends on healthy DB, serves GraphQL on `5000`.
- `masik_frontend` (Node build -> Nginx static serve), serves SPA on `80`.
- `masik_nginx` (`nginx:alpine`), public entrypoint on host port `80`, routes:
  - `/` -> `masik_frontend:80`
  - `/graphql` -> `masik_backend:5000`

## First Deployment Steps

1. Export production runtime variables on the host (or from your secret manager):
   ```bash
   export JWT_SECRET='<strong-random-secret>'
   export NODE_ENV=production
   export CORS_ALLOWED_ORIGINS='https://subscription.mymentech.com'
   ```
2. Build and start services:
   ```bash
   docker compose up -d --build
   ```
3. Run one-time migration seed:
   ```bash
   docker exec masik_backend node src/scripts/seed.js
   ```
4. Verify endpoints:
   - `http://subscription.mymentech.com/` (frontend)
   - `http://subscription.mymentech.com/graphql` (GraphQL endpoint)

## Operational Notes

- MongoDB is not exposed to host ports; access is internal network only.
- DB persistence path (`./dbdata`) must be backed up.
- If you terminate TLS upstream, preserve `X-Forwarded-*` headers in `nginx/default.conf`.
- Do not store production secrets in repository paths; inject at runtime through host env or secret manager.
- Nginx now enforces baseline response security headers at ingress (CSP, HSTS, frame/referrer/nosniff policies).
