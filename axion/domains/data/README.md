<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:data -->
<!-- AXION:PREFIX:data -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Data — Axion Assembler

**Module slug:** `data`  
**Prefix:** `data`  
**Description:** Data flows, transformations, and validation for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:DATA_SCOPE -->
## Scope & Ownership
- Owns: Data access patterns, storage interface (IStorage), Zod validation schemas, data transformations between layers
- Does NOT own: Database schema (database module), API routes (backend), UI state (state module)

<!-- AXION:SECTION:DATA_SOURCES -->
## Sources & Ingestion
- Source systems list:
  - PostgreSQL database (assemblies, runs, exports)
  - AXION registry files (stage_markers.json, verify_report.json, verify_status.json)
  - AXION config files (domains.json, presets.json, stack_profiles.json)
  - AXION workspace filesystem (templates/, domains/, source_docs/)
- Ingestion method:
  - Database: Direct Drizzle ORM queries via storage interface
  - Registry files: On-demand JSON parsing after run completion
  - Config files: Read at startup and cached; refresh on demand

<!-- AXION:SECTION:DATA_TRANSFORMS -->
## Transforms & Modeling
- Transformation stages:
  1. Raw AXION stdout/stderr → parsed JSON result (try/catch with fallback)
  2. JSON result → Run entity with extracted fields (status, next_commands)
  3. Registry JSON → typed TypeScript objects with Zod validation
  4. Verify report → structured violation list with fix_action hints
- Canonical metrics/dimensions:
  - Run duration: finished_at - started_at
  - Success rate: COUNT(status='success') / COUNT(*) per assembly
  - Module completion: COUNT(verified) / 19 per assembly

<!-- AXION:SECTION:DATA_QUALITY -->
## Data Quality Controls
- Validations:
  - Zod schemas for all API request/response payloads
  - Drizzle insert schemas (createInsertSchema) for database entities
  - JSON schema validation for registry files
- Anomaly detection:
  - Runs stuck in 'running' status > 5 minutes flagged as stale
  - Empty stdout/stderr with non-zero exit code flagged as script error

<!-- AXION:SECTION:DATA_LINEAGE -->
## Lineage & Metadata
- Lineage tracking: Run records link script invocation to output artifacts via assembly_id
- Dataset documentation: Zod schemas serve as living documentation; shared/schema.ts is source of truth

<!-- AXION:SECTION:DATA_ACCESS -->
## Access & Governance
- Access control: All data access through IStorage interface; no direct DB queries in routes
- Sensitive data classification: No PII; workspace paths may contain filesystem info (non-sensitive)

<!-- AXION:SECTION:DATA_OBSERVABILITY -->
## Data Observability
- Freshness/volume metrics:
  - ArtifactIndex.updated_at tracks last registry sync
  - Run count per assembly available via dashboard
- Alerting: Console logging for errors; no external alerting for v1

<!-- AXION:SECTION:DATA_ACCEPTANCE -->
## Acceptance Criteria
- [x] Sources + outputs enumerated
- [x] Quality checks defined
- [x] Governance model stated

<!-- AXION:SECTION:DATA_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Always use the IStorage interface for database operations.
2. Parse AXION script JSON output using try/catch with fallback to raw stdout.
3. Use Zod schemas from shared/schema.ts for all validations.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
