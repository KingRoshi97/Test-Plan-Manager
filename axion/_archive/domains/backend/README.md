<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:backend -->
<!-- AXION:PREFIX:be -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Backend — Axion Assembler

**Module slug:** `backend`  
**Prefix:** `be`  
**Description:** Server-side logic, APIs, and business rules for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: Single-tenant per installation (source: RPBS §21)
- Actors & Permission Intents: Single user with full access (source: RPBS §3)
- Core Objects impacted here: Assembly, Run, Export (source: RPBS §4)
- Non-Functional Profile implications: Standard latency <500ms for API calls (source: RPBS §7)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A — internal API only (source: RPBS §22)
- Privacy Controls (Deletion/Export): Yes — delete assembly endpoint (source: RPBS §29)
- Stack Selection Policy alignment: Node.js + Express + TypeScript (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:BE_SCOPE -->
## Scope & Ownership
- Owns: API routes, request validation, job runner orchestration, file API, export generation
- Does NOT own: Database schema (database), UI (frontend), AXION scripts (external)

<!-- AXION:SECTION:BE_API -->
## API Endpoints & Handlers

### Assembly Management
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/assemblies | Create new assembly + run init |
| GET | /api/assemblies | List all assemblies with health |
| GET | /api/assemblies/:id | Get assembly details |
| DELETE | /api/assemblies/:id | Delete assembly and files |

### Pipeline Execution
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/assemblies/:id/run | Execute stage (body: stage, mode, module?) |
| GET | /api/runs/:runId | Get run status + logs |
| GET | /api/runs/:runId/stream | SSE stream for live logs |

### Artifacts & Files
| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/assemblies/:id/artifacts | Get artifact index |
| GET | /api/files | Read file content (query: path) |
| PUT | /api/files | Update file content (allowed paths only) |

### Export
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/assemblies/:id/export | Generate Agent Kit ZIP |
| GET | /api/exports/:exportId/download | Download ZIP file |

<!-- AXION:SECTION:BE_DOMAIN -->
## Domain Logic & Rules
- Core business rules:
  - Lock gate: refuse lock unless verify_report.overall_status === 'PASS'
  - Blocked_by handling: if script outputs status=blocked_by, extract missing prereqs
  - Module order: for --all mode, preserve canonical dependency order from domains.json
  - No template mutation: templates read-only unless Template Edit Mode enabled
- Validation rules: Zod schemas for all request bodies
- State machines: Run status transitions (queued → running → success/failed/blocked_by)

<!-- AXION:SECTION:BE_JOBS -->
## Async Jobs & Queues
- Job list + triggers:
  - Pipeline stage execution: triggered by POST /api/assemblies/:id/run
  - Export generation: triggered by POST /api/assemblies/:id/export
- Job runner design:
  - Node child_process.spawn for AXION script execution
  - Queue: one job active per assembly at a time
  - Capture stdout/stderr incrementally
  - Parse JSON from script output
- Retry/backoff: No automatic retry; user must re-trigger
- DLQ: Failed runs stored with exit_code and stderr

<!-- AXION:SECTION:BE_CACHING -->
## Caching Strategy
- Cache layers: In-memory cache for config files (domains.json, presets.json)
- Invalidation: Manual refresh via API or on file change detection

<!-- AXION:SECTION:BE_INTEGRATION -->
## Integration Points
- External services: None for v1 (all local execution)
- AXION scripts: Called via child_process.spawn with working directory set to workspace_path

<!-- AXION:SECTION:BE_OBSERVABILITY -->
## Observability
- Structured logging: Winston/console with requestId, timestamp, level
- Metrics: Run count, success/fail rate (logged, not exported)
- Tracing: requestId correlation across log entries

<!-- AXION:SECTION:BE_RELIABILITY -->
## Reliability & Resilience
- Timeouts: 120s timeout for AXION script execution
- Graceful degradation: If script fails, run marked failed with captured stderr
- Circuit breakers: N/A — no external services

<!-- AXION:SECTION:BE_SECURITY -->
## Backend Security
- Input validation: Zod schemas on all endpoints; reject invalid input with 400
- Path traversal prevention: Validate file paths within workspace_path
- Secrets management: Environment variables via process.env

<!-- AXION:SECTION:BE_ACCEPTANCE -->
## Acceptance Criteria
- [x] Business rules enumerated
- [x] Failure handling documented
- [x] Observability requirements defined

<!-- AXION:SECTION:BE_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Always call existing AXION scripts; never re-implement AXION logic.
2. Store every run with full logs and JSON output for auditability.
3. Enforce lock gate: refuse lock unless verify passes.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
