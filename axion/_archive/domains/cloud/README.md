<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:cloud -->
<!-- AXION:PREFIX:cloud -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Cloud — Axion Assembler

**Module slug:** `cloud`  
**Prefix:** `cloud`  
**Description:** Cloud infrastructure, scaling, and hosting for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:CLOUD_SCOPE -->
## Scope & Ownership
- Owns: Hosting configuration, database provisioning, domain/TLS
- Does NOT own: Application code (backend/frontend), CI/CD (devops)

<!-- AXION:SECTION:CLOUD_ARCH -->
## Cloud Architecture
- Account/project structure: Single Replit project
- Network topology: Replit-managed; automatic port forwarding for 5000

<!-- AXION:SECTION:CLOUD_ID -->
## Identity & Access (IAM)
- Roles and policies: Replit account owner has full access
- Workload identity: N/A — Replit manages runtime identity

<!-- AXION:SECTION:CLOUD_COMPUTE -->
## Compute & Runtime
- Compute type: Replit container (always-on deployment)
- Autoscaling: N/A — single instance for v1

<!-- AXION:SECTION:CLOUD_STORAGE -->
## Storage & Data Services
- Storage systems:
  - PostgreSQL: Replit-managed Neon database
  - Filesystem: Replit persistent storage for workspaces
- Encryption: Database encrypted at rest by Neon

<!-- AXION:SECTION:CLOUD_DR -->
## Resilience & DR
- RPO/RTO targets: RPO 24h, RTO 1h (daily backups)
- Backup/restore: Replit checkpoint system for code; manual database backups

<!-- AXION:SECTION:CLOUD_COST -->
## Cost Controls
- Budgeting: Replit plan limits
- Cost allocation: N/A — single project

<!-- AXION:SECTION:CLOUD_ACCEPTANCE -->
## Acceptance Criteria
- [x] Topology documented
- [x] IAM model documented
- [x] DR targets specified

<!-- AXION:SECTION:CLOUD_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Use Replit's built-in PostgreSQL for database.
2. Store workspaces in persistent filesystem.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
