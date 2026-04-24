# POPIA and GDPR Compliance Baseline

- Purpose limitation and data minimization are enforced per service schema.
- Subject Access Request endpoints are provided in `auth-service`.
- Audit records are retained in immutable storage (S3 Object Lock target bucket).
- Sensitive records must have retention policy jobs and deletion workflows.
