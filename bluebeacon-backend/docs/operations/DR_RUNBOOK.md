# Disaster Recovery Runbook

## Objectives
- RTO: less than 4 hours
- RPO: less than 1 hour

## Recovery Steps
1. Promote latest healthy RDS snapshot/PITR target.
2. Restore Redis from backup or warm replica.
3. Rehydrate service deployments via Helm in failover region.
4. Verify gateway health and critical end-to-end flow.
5. Publish incident status update and post-mortem.
