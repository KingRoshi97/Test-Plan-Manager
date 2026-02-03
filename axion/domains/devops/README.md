<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:devops -->
<!-- AXION:PREFIX:devops -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# DevOps — Axion Assembler

**Module slug:** `devops`  
**Prefix:** `devops`  
**Description:** CI/CD, deployment, and infrastructure automation for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:DEVOPS_SCOPE -->
## Scope & Ownership
- Owns: CI/CD pipelines, deployment configuration, environment management
- Does NOT own: Cloud infrastructure (cloud), application code (backend/frontend)

<!-- AXION:SECTION:DEVOPS_CICD -->
## CI/CD Pipelines
- Build pipeline stages:
  1. Install dependencies (npm ci)
  2. Type check (tsc --noEmit)
  3. Lint (eslint)
  4. Test (vitest run)
  5. Build (vite build)
- Deploy pipeline stages:
  1. Run migrations (npm run db:push)
  2. Deploy to Replit (automatic on push)

<!-- AXION:SECTION:DEVOPS_RELEASE -->
## Release & Rollback
- Rollout strategy: Single deployment on push to main
- Rollback strategy: Revert commit and push; automatic redeploy

<!-- AXION:SECTION:DEVOPS_ENV -->
## Environments & Config
- Env list:
  - Development: Local with SQLite or PostgreSQL
  - Production: Replit with PostgreSQL
- Config injection: Environment variables via Replit Secrets

<!-- AXION:SECTION:DEVOPS_OBS -->
## Observability & Alerting
- Alert routing: N/A for v1 — console logging only
- SLO/SLI alignment: N/A for v1

<!-- AXION:SECTION:DEVOPS_ONCALL -->
## On-call & Incidents
- On-call schedule: N/A — single developer
- Incident process: Review logs, fix, redeploy

<!-- AXION:SECTION:DEVOPS_RUNBOOKS -->
## Runbooks
- Runbook index:
  - Start app: `npm run dev`
  - Run migrations: `npm run db:push`
  - Reset database: Delete and recreate via Replit UI

<!-- AXION:SECTION:DEVOPS_ACCEPTANCE -->
## Acceptance Criteria
- [x] Pipelines enumerated
- [x] Rollback strategy exists
- [x] Runbook index exists

<!-- AXION:SECTION:DEVOPS_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Always run migrations before deploying schema changes.
2. Use Replit's automatic deployment for production.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
