<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:devops -->
<!-- AXION:PREFIX:devops -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# DevOps — AXION Module Template (Blank State)

**Module slug:** `devops`  
**Prefix:** `devops`  
**Description:** CI/CD, deployment, and infrastructure automation

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:DEVOPS_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the devops module.
"Owns" = CI/CD pipelines, deployment automation, release management, environment configuration, on-call process, runbooks.
"Does NOT own" = cloud infrastructure provisioning (cloud module), application code (all other modules), test strategy (testing module), security policies (security module).
Common mistake: conflating devops with cloud — devops owns the pipeline and release process; cloud owns infrastructure provisioning and scaling. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:DEVOPS_CICD -->
## CI/CD Pipelines
<!-- AGENT: Derive from REBS §1 stack selection for CI/CD tooling and architecture module for build requirements.
Build pipeline = stages in order (checkout → install → lint → typecheck → test → build → publish), with timeout and resource limits per stage.
Deploy pipeline = stages (artifact promotion → pre-deploy checks → deploy → smoke tests → monitoring), deployment targets per environment.
Common mistake: not including rollback steps in the deploy pipeline — every deploy stage should have a corresponding rollback procedure. -->
- Build pipeline stages: [TBD]
- Deploy pipeline stages: [TBD]


<!-- AXION:SECTION:DEVOPS_RELEASE -->
## Release & Rollback
<!-- AGENT: Derive from RPBS §7 Non-Functional Profile for availability requirements during deploys.
Rollout strategy = deployment method (blue-green, canary, rolling), traffic shifting percentages, bake time between stages.
Rollback strategy = automated rollback triggers (error rate spike, health check failure), manual rollback process, database migration rollback approach.
Common mistake: having rollback strategy that doesn't account for database migrations — schema changes need forward-compatible rollback plans. -->
- Rollout strategy: [TBD]
- Rollback strategy: [TBD]


<!-- AXION:SECTION:DEVOPS_ENV -->
## Environments & Config
<!-- AGENT: Derive from architecture module deployment topology and RPBS §7 for environment parity requirements.
Env list = each environment (local, dev, staging, production) with purpose, who has access, data characteristics (synthetic vs anonymized production).
Config injection = how environment-specific config is provided (env vars, config maps, parameter store), secret injection method, config validation on startup.
Common mistake: significant divergence between staging and production — environments should be as similar as possible to catch issues before production. -->
- Env list (dev/stage/prod): [TBD]
- Config injection strategy: [TBD]


<!-- AXION:SECTION:DEVOPS_OBS -->
## Observability & Alerting
<!-- AGENT: Derive from systems module observability requirements and RPBS §7 for SLO targets.
Alert routing = which alerts go to which team/channel (PagerDuty, Slack), severity-based routing, alert grouping/dedup rules.
SLO/SLI alignment = map each SLO to the SLI that measures it, error budget calculation, burn rate alerts.
Common mistake: alerting on symptoms without actionable response — every alert should have a corresponding runbook or action. -->
- Alert routing: [TBD]
- SLO/SLI alignment: [TBD]


<!-- AXION:SECTION:DEVOPS_ONCALL -->
## On-call & Incidents
<!-- AGENT: Derive from RPBS §7 for availability requirements that drive on-call needs.
On-call schedule = rotation model (weekly, follow-the-sun), escalation tiers, compensation/time-off policy.
Incident process = severity levels (SEV1-SEV4) with response time requirements, communication channels, post-incident review process.
Common mistake: on-call without runbooks — every alert that pages on-call must have a corresponding runbook with resolution steps. -->
- On-call schedule model: [TBD]
- Incident process: [TBD]


<!-- AXION:SECTION:DEVOPS_RUNBOOKS -->
## Runbooks
<!-- AGENT: Create an index of operational runbooks for common incidents and maintenance tasks.
Runbook index = list of runbooks (title, trigger condition, owner, last reviewed date), covering: deployment failures, database issues, integration outages, scaling events.
Common mistake: writing runbooks once and never updating them — each runbook should have a review cadence and last-verified date. -->
- Runbook index: [TBD]


<!-- AXION:SECTION:DEVOPS_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Pipelines enumerated
- [ ] Rollback strategy exists
- [ ] Runbook index exists


<!-- AXION:SECTION:DEVOPS_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved devops decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting REBS §1 for CI/CD platform selection").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
