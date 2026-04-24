# BlueBeacon Backend Feature Status (Spec Comparison)

This document compares the current backend implementation in `bluebeacon-backend` against the DPS spec in `DPS_GUIDE/police_station_app_guide.pdf`.

Scope: backend only.

## Implemented Backend Features

### Architecture and Platform
- Monorepo structure with separate backend services under `apps/`.
- API gateway service with service routing/proxy and request ID middleware.
- Shared backend packages for types, config, logging, events, audit helpers, and auth middleware.
- Local infra baseline via Docker Compose: PostgreSQL, Redis, NATS, MinIO, ClamAV, Traefik.

### Service Scaffolding
- All major backend services from the spec are present:
  - `api-gateway`, `auth-service`, `incident-service`, `case-service`, `arrest-service`,
    `warrant-service`, `evidence-service`, `dispatch-service`, `map-service`,
    `notification-service`, `document-service`, `admin-service`.

### Core API Coverage (Baseline)
- Auth: register/login/refresh/logout, lockout logic, SAR endpoint stub.
- Incident: create incident, status query, transition endpoint, basic websocket subscribe/update.
- Case: docket create, status transition, notes, charges.
- Arrest: create arrest, bail apply endpoint, cell board, suspect check endpoint.
- Warrant: create warrant, review, PDF generation endpoint, expiry endpoint.
- Evidence: create evidence, custody updates, custody log endpoint, barcode endpoint.
- Dispatch: call creation, reassignment, unit position updates, websocket event broadcast.
- Map: map layers endpoint (GeoJSON), hotspot create/expire, aggregation stub endpoint.
- Notification: preferences, notify endpoint, officer broadcast endpoint, SOS endpoint.
- Document: generic document create and PDF stream endpoint.
- Admin: basic audit endpoint and metrics endpoint.

### Data and Infra Assets
- Prisma schemas created across backend services.
- Initial migration/seed placeholders created.
- Per-service database initialization script present.

### Delivery and Operational Baseline
- CI workflow for lint/typecheck/test/build.
- Staging/prod/security/load workflow files present.
- Terraform, Helm, and K8s baseline folders present.
- Compliance and operations docs initialized.

## Missing Features Sorted by Plan Phases

## Phase 1 - Planning and Architecture Gaps
- Secure internal API gateway model is incomplete:
  - Gateway proxies traffic, but centralized auth/RBAC enforcement is not fully implemented end-to-end.
- Inter-service event orchestration is incomplete:
  - Event publishing exists, but subscriber/consumer workflows are largely missing.

## Phase 2 - Database Design and Persistence Gaps
- Runtime services still use in-memory `Map` stores instead of Prisma/PostgreSQL persistence.
- Guide-level relational behavior (FK integrity, persistent workflows, transactional updates) is not active in runtime APIs.
- PostGIS/advanced geospatial DB functionality is not implemented as a running data layer.

## Phase 3 - Backend Development Gaps

### Step 5 (Project Setup)
- PgBouncer is not implemented.
- Secrets manager integration (AWS Secrets Manager / Vault) is not implemented.
- Docker Compose does not run all app services as production-like stack components.

### Step 6 (Auth and Identity)
- OAuth2 flow is not implemented.
- Identity verification integrations are missing:
  - Civilian ID lookup flow.
  - Officer badge + HR sync flow.
- MFA is currently a stub; no real Twilio OTP enforcement or judge hardware/biometric path.
- Access-token handling is not fully aligned with strict cookie-based policy from spec.
- RBAC is not consistently applied across all protected backend routes.

### Step 7 (Incident and Case)
- Auto-assignment to nearest available officer by GPS is not implemented (currently random assignment).
- Full investigation-notes workflow (timestamps, document uploads, evidence tagging) is incomplete.
- Incident acceptance to docket auto-creation orchestration is not fully wired as transactional flow.

### Step 8 (Arrest and Detention)
- Full intake features (e.g., biometrics-rich capture) are not implemented.
- Bail workflow lacks complete officer -> judge -> signed decision chain.
- Detention timer queue producer exists, but full alert processing/worker pipeline is incomplete.
- Suspect checks are not integrated with persistent warrants/arrests system-of-record.

### Step 9 (Warrant)
- Digital certificate-based warrant signing is not implemented.
- Full warrant domain model and lifecycle controls from spec are only partially represented.
- Real-time judge notification processing is not fully wired.

### Step 10 (Evidence)
- Secure S3 upload flow with enforced server-side encryption is not fully implemented in service logic.
- ClamAV scan-before-store workflow is not enforced in upload path.
- Disposal workflow lacks full dual-approval state machine enforcement.

## Phase 4 - Map and Alerts Gaps

### Step 11 (Map Service)
- Role-aware map filtering is only partial.
- Geo-fencing engine (users-in-radius detection and alert fanout) is not implemented.
- Nightly 30-day hotspot aggregation is currently stubbed.
- Full map feature set (stations/roadblocks/alerts overlays and related backend logic) is incomplete.

### Step 12 (Notification and Alerts)
- FCM integration is not implemented.
- Twilio SMS delivery logic is not implemented.
- Notification preference routing logic is partial.
- Emergency bypass policy enforcement is incomplete.
- SOS nearest-station dispatch workflow is partial.

## Phase 5 - Frontend-Linked Backend Contracts (Backend Portion Only)
- Signature hash/certificate workflows for judicial signing are partial and not compliant with legal-signature grade controls.
- Several frontend-expected backend contracts remain stub-level and not production-ready.

## Phase 6 - Security and Compliance Gaps
- Full route-level server-side validation/sanitization is incomplete.
- Per-IP and per-user rate limits are not comprehensively enforced on all routes.
- Comprehensive write-audit logging with before/after state is not consistently implemented.
- Immutable/WORM audit storage is not implemented end-to-end.
- File upload hardening rules (full AV pipeline, strict policy enforcement) are incomplete.
- Session revocation/invalidation policies (e.g., all sessions on password change/suspension) are incomplete.
- Data masking by role/precinct is not consistently enforced.
- Legal compliance artifacts exist as templates but are not fully operationalized in services.

## Phase 7 - Testing, CI/CD, Monitoring, Deployment Gaps
- Unit/integration coverage target (80%+) is not implemented as enforced quality gate.
- Integration and end-to-end critical journey tests are largely stub-level.
- Security testing pipeline includes placeholders (e.g., ZAP step).
- SonarQube/advanced static security scanning integration is not fully implemented.
- OpenAPI/Swagger aggregation is placeholder-level and incomplete.
- Blue/green deployment, automated rollback on error threshold, and full staging/prod release controls are not fully implemented.
- Monitoring dashboards and alerting integrations are initialized but not fully operationalized.
- Backup/PITR validation and DR operational drills are documented but not fully automated/proven.

## Phase 8 - Rollout and Operationalization Gaps (Backend-Relevant)
- Pilot/parallel-run support workflows and operational metrics instrumentation are not fully implemented.
- Full production governance and launch-readiness controls are incomplete.

## Practical Status Summary
- Current state: strong backend scaffold and partial functional baseline.
- Not yet production-ready against full DPS spec.
- Largest blockers: real persistence, security/compliance hardening, external integrations (Twilio/FCM/geo), and full testing/CI/CD enforcement.
