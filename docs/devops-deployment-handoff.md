# DevOps Handoff - Masik Chada

This handoff provides the deployment baseline for `subscription.mymentech.com` using Docker Compose and Nginx reverse proxy. Production browser traffic is HTTPS-only and must terminate TLS before requests enter the Compose stack.

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
- `masik_nginx` (`nginx:alpine`), internal HTTP ingress for the Compose stack on host port `80`, routes:
  - `/` -> `masik_frontend:80`
  - `/graphql` -> `masik_backend:5000`
- Browser-facing TLS termination is not implemented in this repo. Release traffic must arrive through an upstream load balancer, reverse proxy, or CDN that:
  - terminates TLS for `subscription.mymentech.com`
  - redirects plain HTTP to HTTPS before requests reach application routes
  - forwards `X-Forwarded-Proto: https` to the Compose Nginx container

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
4. Verify browser-facing endpoints through the TLS terminator:
   - `https://subscription.mymentech.com/` (frontend)
   - `https://subscription.mymentech.com/graphql` (GraphQL endpoint)
5. Verify the internal Compose ingress only from the host or private network:
   - `curl -H 'Host: subscription.mymentech.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1/`
   - `curl -H 'Host: subscription.mymentech.com' -H 'X-Forwarded-Proto: https' -H 'Content-Type: application/json' http://127.0.0.1/graphql -d '{"query":"{__typename}"}'`

## Operational Notes

- MongoDB is not exposed to host ports; access is internal network only.
- DB persistence path (`./dbdata`) must be backed up.
- TLS termination remains outside the tracked repo. The release owner must provision and operate the external TLS endpoint for `subscription.mymentech.com`.
- Preserve `X-Forwarded-*` headers, especially `X-Forwarded-Proto: https`, when forwarding from the TLS terminator into `nginx/default.conf`.
- Do not store production secrets in repository paths; inject at runtime through host env or secret manager.
- Nginx now enforces baseline response security headers at ingress (CSP, HSTS, frame/referrer/nosniff policies) and only allows HTTPS browser origins in CSP/CORS defaults.
