# BlueBeacon Backend

Node.js + TypeScript unified backend service implementing the Digital Police Station guide.

## Quick Start

1. `cd bluebeacon-backend`
2. `docker compose -f infra/docker-compose.yml up -d`
3. `npm install`
4. `npm run dev`

## Service

- `api-gateway` (single unified backend runtime)

## API Documentation

- Unified docs: `http://localhost:4000/docs`
- Unified OpenAPI: `http://localhost:4000/openapi.json`

Set `EXPOSE_DOCS=protected` to require authenticated admin access for `/docs` and `/openapi.json`.
