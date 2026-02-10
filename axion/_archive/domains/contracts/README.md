<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:contracts -->
<!-- AXION:PREFIX:contract -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Contracts — Axion Assembler

**Module slug:** `contracts`  
**Prefix:** `contract`  
**Description:** API contracts, interfaces, and data schemas for Axion Assembler

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
- Non-Functional Profile implications: N/A (source: RPBS §7)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A — internal API only (source: RPBS §22)
- Stack Selection Policy alignment: REST JSON API (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:CONTRACT_SCOPE -->
## Scope & Ownership
- Owns: API endpoint specifications, request/response schemas, error model, Zod validation schemas
- Does NOT own: Route implementations (backend), database schema (database)

<!-- AXION:SECTION:CONTRACT_API_SURFACE -->
## API Surface Inventory
| Method | Path | Purpose | Owner |
|--------|------|---------|-------|
| POST | /api/assemblies | Create assembly | backend |
| GET | /api/assemblies | List assemblies | backend |
| GET | /api/assemblies/:id | Get assembly details | backend |
| DELETE | /api/assemblies/:id | Delete assembly | backend |
| POST | /api/assemblies/:id/run | Execute pipeline stage | backend |
| GET | /api/runs/:runId | Get run status | backend |
| GET | /api/runs/:runId/stream | SSE log stream | backend |
| GET | /api/assemblies/:id/artifacts | Get artifact index | backend |
| GET | /api/files | Read file content | backend |
| PUT | /api/files | Update file content | backend |
| POST | /api/assemblies/:id/export | Generate Agent Kit | backend |
| GET | /api/exports/:exportId/download | Download ZIP | backend |

<!-- AXION:SECTION:CONTRACT_SCHEMAS -->
## Schemas & Types
- Request/response schemas: Defined in shared/schema.ts using Zod
- Canonical types:
  - Assembly: id, name, description, workspace_path, selected_preset, selected_plan, selected_stack_profile, last_run_id, created_at, updated_at
  - Run: id, assembly_id, stage, mode, module, status, started_at, finished_at, stdout, stderr, json_result, exit_code, next_commands
  - Export: id, assembly_id, filename, file_path, manifest, created_at
- Versioning: N/A for v1 — single version

<!-- AXION:SECTION:CONTRACT_ERRORS -->
## Error Model
- Error envelope:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Human-readable message",
      "details": { "field": "reason" }
    }
  }
  ```
- Error codes:
  | Code | HTTP | Meaning |
  |------|------|---------|
  | VALIDATION_ERROR | 400 | Invalid input |
  | NOT_FOUND | 404 | Resource not found |
  | OPERATION_BLOCKED | 409 | Operation not allowed (e.g., lock without verify) |
  | INTERNAL_ERROR | 500 | Server error |
- Client-facing: All errors use consistent envelope; internal stack traces logged only

<!-- AXION:SECTION:CONTRACT_VERSIONING -->
## Compatibility & Versioning
- Versioning rules: N/A for v1 — no versioning
- Backward compatibility: Additive changes only
- Deprecation policy: N/A

<!-- AXION:SECTION:CONTRACT_EVENTS -->
## Events, Webhooks, Async Contracts
- Event list: N/A — no webhooks for v1
- Delivery guarantees: N/A
- Idempotency keys: N/A

<!-- AXION:SECTION:CONTRACT_SECURITY -->
## Security & Privacy Constraints
- Auth requirements: Session cookie validation on all endpoints (if auth enabled)
- PII fields: None — no user data stored

<!-- AXION:SECTION:CONTRACT_ACCEPTANCE -->
## Acceptance Criteria
- [x] All public endpoints enumerated
- [x] Schema ownership is explicit
- [x] Error and versioning rules documented

<!-- AXION:SECTION:CONTRACT_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Use Zod schemas from shared/schema.ts for all validation.
2. Return consistent error envelope on all errors.
3. Add new endpoints to API Surface Inventory table.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
