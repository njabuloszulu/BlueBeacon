# POPIA and GDPR Compliance Baseline

- Purpose limitation and data minimization are enforced per service schema.
- Subject Access Request endpoints are provided under the unified API auth module (`/auth` routes).
- Audit records are retained in immutable storage (S3 Object Lock target bucket).
- Sensitive records must have retention policy jobs and deletion workflows.
