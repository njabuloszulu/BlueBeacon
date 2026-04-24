# Unified API Migration

The backend now runs as a single unified service through `api-gateway` on port `4000`.

## Canonical API docs

- `http://localhost:4000/docs`
- `http://localhost:4000/openapi.json`

## Legacy URLs

Legacy direct service URLs are deprecated and no longer part of the supported developer workflow:

- `http://localhost:4001/*` through `http://localhost:4011/*`

Use prefixed routes through the unified service instead:

- `/auth/*`
- `/incident/*`
- `/case/*`
- `/arrest/*`
- `/warrant/*`
- `/evidence/*`
- `/dispatch/*`
- `/map/*`
- `/notification/*`
- `/document/*`
- `/admin/*`

## Realtime

Socket clients must connect to the unified origin on port `4000`.

## Environment updates

Per-service upstream URL variables are deprecated for local unified mode:

- `AUTH_SERVICE_URL`
- `INCIDENT_SERVICE_URL`
- `CASE_SERVICE_URL`
- `ARREST_SERVICE_URL`
- `WARRANT_SERVICE_URL`
- `EVIDENCE_SERVICE_URL`
- `DISPATCH_SERVICE_URL`
- `MAP_SERVICE_URL`
- `NOTIFICATION_SERVICE_URL`
- `DOCUMENT_SERVICE_URL`
- `ADMIN_SERVICE_URL`
