<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:fullstack -->
<!-- AXION:PREFIX:fs -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Fullstack — Axion Assembler

**Module slug:** `fullstack`  
**Prefix:** `fs`  
**Description:** End-to-end flows connecting frontend and backend for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: Single-tenant (source: RPBS §21)
- Actors & Permission Intents: Single user (source: RPBS §3)
- Core Objects impacted here: Assembly, Run, Export (source: RPBS §4)
- Non-Functional Profile implications: E2E latency <1s for pipeline operations (source: RPBS §7)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Stack Selection Policy alignment: React + Express + PostgreSQL (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:FS_SCOPE -->
## Scope & Ownership
- Owns: E2E flow coordination, shared types between FE/BE, error mapping
- Does NOT own: Individual FE components (frontend), individual API routes (backend)

<!-- AXION:SECTION:FS_E2E_FLOWS -->
## End-to-End Flows

### Flow A: Create Assembly
1. UI: NewAssemblyForm submits → POST /api/assemblies
2. API: Creates assembly record, runs axion-init.mjs
3. DB: Assembly + Run records created
4. UI: Query invalidated, redirect to Control Room

### Flow B: Run Pipeline Stage
1. UI: User clicks stage button → POST /api/assemblies/:id/run
2. API: Creates Run (queued), spawns AXION script
3. SSE: Logs streamed to UI via /api/runs/:runId/stream
4. API: Parses JSON result, updates Run (success/failed)
5. UI: Query invalidated, status updated

### Flow C: Export Agent Kit
1. UI: User clicks Export → POST /api/assemblies/:id/export
2. API: Generates ZIP with domains, registry, manifest
3. DB: Export record created
4. UI: Download link displayed

<!-- AXION:SECTION:FS_CONTRACT_ALIGNMENT -->
## Contract Alignment
- Shared types: shared/schema.ts contains Drizzle schemas + Zod types
- Type sharing: Insert types and select types exported for FE/BE use
- Backward compatibility: Additive changes only; no breaking changes

<!-- AXION:SECTION:FS_RELEASE -->
## Release & Compatibility
- Deployment ordering: Schema migrations → Backend → Frontend
- Feature flags: N/A for v1

<!-- AXION:SECTION:FS_ERRORS -->
## Cross-Layer Error Handling
- Error mapping:
  | BE Code | FE Message |
  |---------|------------|
  | 400 | Invalid input: [field errors] |
  | 404 | Assembly not found |
  | 409 | Operation blocked: [reason] |
  | 500 | Something went wrong. Please try again. |
- Retries: User manually retries via UI
- Recovery: Error toast with action button to retry

<!-- AXION:SECTION:FS_OBSERVABILITY -->
## Tracing & Correlation
- Correlation IDs: requestId generated per request, logged throughout
- Trace propagation: requestId passed in response headers

<!-- AXION:SECTION:FS_TESTING -->
## E2E & Contract Testing
- E2E test matrix:
  | Test | Covers |
  |------|--------|
  | Create assembly | Wizard → API → DB → Redirect |
  | Run stage | Button → SSE stream → Status update |
  | Verify gating | Lock blocked when verify fails |
  | Export | Generate ZIP → Download |
- Contract tests: Zod schemas validate API responses

<!-- AXION:SECTION:FS_SECURITY -->
## E2E Security & Privacy
- Data exposure: Only workspace files visible; no cross-assembly leakage
- Auth/session: Session validated on every API call (if auth enabled)

<!-- AXION:SECTION:FS_ACCEPTANCE -->
## Acceptance Criteria
- [x] E2E flows fully enumerated
- [x] Release constraints stated
- [x] Correlation/tracing rules defined

<!-- AXION:SECTION:FS_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Use shared types from shared/schema.ts for FE/BE alignment.
2. Map all backend errors to user-friendly messages.
3. Include requestId in all log entries for tracing.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
