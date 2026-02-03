<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:systems -->
<!-- AXION:PREFIX:sys -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Systems — Axion Assembler

**Module slug:** `systems`  
**Prefix:** `sys`  
**Description:** System components, services, and their interactions for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: Single-tenant per installation (source: RPBS §21)
- Actors & Permission Intents: Single user with full access (source: RPBS §3)
- Core Objects impacted here: Assembly, Run (source: RPBS §4)
- Non-Functional Profile implications: Standard latency, single-instance deployment (source: RPBS §7)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A — not a billing app (source: RPBS §14)
  - Notifications: N/A — no notifications (source: RPBS §11)
  - Uploads/Media: N/A — filesystem-based (source: RPBS §13)
  - Public API: N/A — internal only (source: RPBS §22)
- Stack Selection Policy alignment: Node.js + Express + PostgreSQL (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:SYS_SCOPE -->
## Scope & Ownership
- Owns: Runtime process model, component interactions, failure modes, system-level observability
- Does NOT own: Database schema (database), API routes (backend), UI components (frontend)

<!-- AXION:SECTION:SYS_COMPONENTS -->
## System Components & Services
- Component inventory:
  | Component | Purpose | Owner |
  |-----------|---------|-------|
  | Express Server | HTTP API serving | backend |
  | Vite Dev Server | Frontend serving (dev) | frontend |
  | PostgreSQL | Data persistence | database |
  | Job Runner | AXION script execution | backend |
  | SSE Endpoint | Live log streaming | backend |
- Inter-service communication: Frontend → REST API → Backend; Backend → spawn → AXION scripts

<!-- AXION:SECTION:SYS_RUNTIME -->
## Runtime Model
- Processes: Single Node.js process (Express + Vite bundled)
- Concurrency model: One active job per assembly; concurrent requests for different assemblies allowed
- Backpressure: Jobs queued in-memory; one active per assembly
- Retry strategy: No automatic retry; user must re-trigger failed stages

<!-- AXION:SECTION:SYS_FAILURE_MODES -->
## Failure Modes & Recovery
- Known failure modes:
  | Failure | Impact | Recovery |
  |---------|--------|----------|
  | Script timeout | Run marked failed | User re-runs |
  | Script error | Run marked failed with stderr | User fixes issue, re-runs |
  | Database connection lost | API errors | Replit auto-restarts |
  | OOM | Process crashes | Replit auto-restarts |
- Degradation strategy: Fail-fast on errors; display error to user
- Safe shutdown: Complete active jobs or mark as failed; graceful process exit

<!-- AXION:SECTION:SYS_CONFIG -->
## Configuration & Feature Control
- Configuration sources:
  - Environment variables: DATABASE_URL, SESSION_SECRET
  - AXION config files: domains.json, presets.json, stack_profiles.json
- Feature flags: N/A for v1

<!-- AXION:SECTION:SYS_OBSERVABILITY -->
## Observability (System-Level)
- Logging requirements: Structured console logs with timestamp, requestId, level (info/warn/error)
- Metrics (golden signals): N/A for v1 — console logging only
- Tracing: requestId correlation across log entries

<!-- AXION:SECTION:SYS_SECURITY_BASELINE -->
## Security Baseline
- Secrets handling: Environment variables only; never log secrets
- Least-privilege: AXION scripts run with same permissions as app
- Dependency hygiene: npm audit; update regularly

<!-- AXION:SECTION:SYS_ACCEPTANCE -->
## Acceptance Criteria
- [x] Component inventory exists
- [x] Failure modes + recovery documented
- [x] Observability requirements specified

<!-- AXION:SECTION:SYS_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Always log with requestId for tracing.
2. One active job per assembly; queue additional requests.
3. Mark runs as failed on timeout or error.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
