# Observability and On-Call

- Metrics: Prometheus scrapes gateway and admin service metrics.
- Dashboards: Grafana dashboard template included in `infra/observability`.
- Error Tracking: Sentry DSN should be configured per service via env.
- Log Aggregation: ship pino JSON logs to Loki.
- Paging: PagerDuty service per domain (auth, ops, map-alerts).
