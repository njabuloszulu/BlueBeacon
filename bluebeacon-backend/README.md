# BlueBeacon Backend

Node.js + TypeScript microservices backend implementing the Digital Police Station guide.

## Quick Start

1. `cd bluebeacon-backend`
2. `docker compose -f infra/docker-compose.yml up -d`
3. `npm install`
4. `npm run dev`

## Services

- `api-gateway`
- `auth-service`
- `incident-service`
- `case-service`
- `arrest-service`
- `warrant-service`
- `evidence-service`
- `dispatch-service`
- `map-service`
- `notification-service`
- `document-service`
- `admin-service`

## API Documentation

- Gateway aggregated docs: `http://localhost:4000/docs`
- Gateway OpenAPI index: `http://localhost:4000/openapi.json`
- Service docs:
  - `http://localhost:4001/docs` (`auth-service`)
  - `http://localhost:4002/docs` (`incident-service`)
  - `http://localhost:4003/docs` (`case-service`)
  - `http://localhost:4004/docs` (`arrest-service`)
  - `http://localhost:4005/docs` (`warrant-service`)
  - `http://localhost:4006/docs` (`evidence-service`)
  - `http://localhost:4007/docs` (`dispatch-service`)
  - `http://localhost:4008/docs` (`map-service`)
  - `http://localhost:4009/docs` (`notification-service`)
  - `http://localhost:4010/docs` (`document-service`)
  - `http://localhost:4011/docs` (`admin-service`)

Set `EXPOSE_DOCS=protected` to require authenticated admin access for `/docs` and `/openapi.json` endpoints.
