<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:data -->
<!-- AXION:PREFIX:data -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Data — AXION Module Template

**Module slug:** `data`  
**Prefix:** `data`  
**Description:** Data flows, transformations, and validation for Axion Assembler

> Populated during AXION draft stage based on user input.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:DATA_SCOPE -->
## Scope & Ownership
- Owns: Data access patterns, storage interface, Zod validation schemas, data transformations
- Does NOT own: Database schema (owned by database module), API routes (owned by backend)

<!-- AXION:SECTION:DATA_SOURCES -->
## Sources & Ingestion
- Source systems list:
  - PostgreSQL database (primary storage for assemblies, runs, exports)
  - AXION registry files (stage_markers.json, verify_report.json, verify_status.json)
  - AXION config files (domains.json, presets.json, stack_profiles.json)
  - AXION workspace filesystem (templates, domains, source_docs)
- Ingestion method (batch/stream/CDC):
  - Database: Direct Drizzle ORM queries
  - Registry files: On-demand JSON parsing when runs complete
  - Config files: Read at startup or on refresh

<!-- AXION:SECTION:DATA_TRANSFORMS -->
## Transforms & Modeling
- Transformation stages:
  1. Raw AXION script output (stdout/stderr) → parsed JSON result
  2. JSON result → Run entity with extracted fields (status, next_commands)
  3. Registry files (JSON) → typed TypeScript objects
  4. Verify report → structured violation list with fix actions
- Canonical metrics/dimensions:
  - Run duration: finished_at - started_at
  - Success rate: COUNT(success) / COUNT(*) per assembly
  - Module completion: seeded/verified/locked counts per assembly

<!-- AXION:SECTION:DATA_QUALITY -->
## Data Quality Controls
- Validations (schema, ranges, referential):
  - Zod schemas for all API request/response payloads
  - Drizzle insert schemas for database entities
  - JSON schema validation for registry files
- Anomaly detection rules:
  - Runs stuck in 'running' status for > 5 minutes flagged
  - Empty stdout/stderr with non-zero exit code flagged

<!-- AXION:SECTION:DATA_LINEAGE -->
## Lineage & Metadata
- Lineage tracking approach: Run records link script invocation to output artifacts
- Dataset documentation expectations: All Zod schemas serve as living documentation

<!-- AXION:SECTION:DATA_ACCESS -->
## Access & Governance
- Access control model: All data access through storage interface (IStorage)
- Sensitive data classification: No PII; workspace paths may contain filesystem info

<!-- AXION:SECTION:DATA_OBSERVABILITY -->
## Data Observability
- Freshness/volume/quality metrics:
  - ArtifactIndex.updated_at tracks last registry sync
  - Run count per assembly
- Alerting and ownership: Backend monitors run queue; logs errors to console

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

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
