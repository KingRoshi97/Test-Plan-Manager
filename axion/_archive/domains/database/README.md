<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:database -->
<!-- AXION:PREFIX:db -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Database — Axion Assembler

**Module slug:** `database`  
**Prefix:** `db`  
**Description:** Database schema, migrations, and data models for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: Single-tenant per installation (source: RPBS §21)
- Actors & Permission Intents: Admin (full access), User (view/execute pipelines) (source: RPBS §3)
- Core Objects impacted here: Assembly, Run, ArtifactIndex, Export (source: RPBS §4)
- Non-Functional Profile implications: Standard latency, small scale tier (source: RPBS §7)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A — not a billing application (source: RPBS §14)
  - Notifications: N/A — no notification system (source: RPBS §11)
  - Uploads/Media: N/A — file handling via filesystem (source: RPBS §13)
  - Public API: N/A — internal API only (source: RPBS §22)
- Privacy Controls (Deletion/Export): Yes — assemblies can be deleted with cascade (source: RPBS §29)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:DB_SCOPE -->
## Scope & Ownership
- Owns: Database schema definitions, Drizzle ORM models, migrations, entity relationships for Assembly, Run, ArtifactIndex, Export tables
- Does NOT own: File system operations, AXION script execution, registry JSON files, template files

<!-- AXION:SECTION:DB_MODELS -->
## Data Models & Tables

### Assembly
Primary entity representing an AXION workspace instance.
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key via gen_random_uuid() |
| name | VARCHAR(255) | Unique assembly name |
| description | TEXT | Optional description |
| workspace_path | VARCHAR(500) | Unique path to AXION workspace folder |
| selected_preset | VARCHAR(100) | Preset from config/presets.json |
| selected_plan | VARCHAR(50) | Stage plan (scaffold/docs/full/release) |
| selected_stack_profile | VARCHAR(100) | Stack profile from stack_profiles.json |
| last_run_id | UUID (nullable) | FK to most recent Run |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### Run
Execution record for a pipeline stage.
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| assembly_id | UUID | FK to Assembly |
| stage | ENUM | init/generate/seed/draft/review/verify/lock/package |
| mode | ENUM | all/module |
| module | VARCHAR(50) | Module slug if mode=module |
| status | ENUM | queued/running/success/failed/blocked_by |
| started_at | TIMESTAMP | Execution start |
| finished_at | TIMESTAMP | Execution end (nullable) |
| stdout | TEXT | Captured stdout |
| stderr | TEXT | Captured stderr |
| json_result | JSONB | Parsed JSON output |
| exit_code | INTEGER | Process exit code |
| next_commands | JSONB | Suggested next commands array |
| created_at | TIMESTAMP | Record creation |

### ArtifactIndex
Tracks key artifact paths for quick access.
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| assembly_id | UUID | FK to Assembly (unique) |
| stage_markers_path | VARCHAR(500) | Path to registry/stage_markers.json |
| verify_status_path | VARCHAR(500) | Path to registry/verify_status.json |
| verify_report_path | VARCHAR(500) | Path to registry/verify_report.json |
| erc_directory_path | VARCHAR(500) | Path to ERC outputs |
| template_hash_path | VARCHAR(500) | Path to template hashes |
| updated_at | TIMESTAMP | Last sync time |

### Export
Export history for Agent Kits.
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| assembly_id | UUID | FK to Assembly |
| filename | VARCHAR(255) | ZIP filename |
| file_path | VARCHAR(500) | Full path to ZIP file |
| manifest | JSONB | Exported manifest.json contents |
| created_at | TIMESTAMP | Export creation time |

- Relationships + cardinality:
  - Assembly 1:N Run (cascade delete)
  - Assembly 1:1 ArtifactIndex (cascade delete)
  - Assembly 1:N Export (cascade delete)

<!-- AXION:SECTION:DB_CONSTRAINTS -->
## Constraints & Integrity
- Primary keys strategy: UUID v4 via gen_random_uuid()
- Uniqueness constraints: Assembly.name UNIQUE, Assembly.workspace_path UNIQUE
- Foreign keys and cascade rules:
  - Run.assembly_id → Assembly.id ON DELETE CASCADE
  - ArtifactIndex.assembly_id → Assembly.id ON DELETE CASCADE
  - Export.assembly_id → Assembly.id ON DELETE CASCADE

<!-- AXION:SECTION:DB_MIGRATIONS -->
## Migrations & Change Management
- Migration tool/process: Drizzle Kit (npm run db:push for dev, npm run db:migrate for production)
- Forward/backward compatibility approach: Schema-first with Drizzle, additive changes preferred
- Zero-downtime migration rules: Use nullable columns for new fields; avoid column renames

<!-- AXION:SECTION:DB_INDEXING -->
## Indexing & Query Performance
- Index strategy:
  - B-tree on Run.assembly_id for run lookups
  - B-tree on Run.status for queue processing
  - B-tree on Run.created_at for chronological ordering
  - B-tree on Assembly.name for lookups
- Known hot queries:
  - List runs by assembly ordered by created_at DESC
  - Get latest run per assembly (WHERE assembly_id=? ORDER BY created_at DESC LIMIT 1)
  - Get pending/running runs (WHERE status IN ('queued','running'))

<!-- AXION:SECTION:DB_RETENTION -->
## Retention, Archival, Deletion
- Retention rules: Runs retained indefinitely for audit trail; exports retained until manually deleted
- Deletion policy: When assembly deleted, cascade deletes all runs, artifacts, exports

<!-- AXION:SECTION:DB_BACKUP_DR -->
## Backup & Disaster Recovery
- Backup cadence + RPO/RTO: Daily backups recommended; RPO 24h; RTO 1h
- Restore validation: Periodic restore tests to staging environment

<!-- AXION:SECTION:DB_ACCEPTANCE -->
## Acceptance Criteria
- [x] Schema is enumerated
- [x] Migration rules documented
- [x] Backup/restore expectations specified

<!-- AXION:SECTION:DB_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Always use Drizzle ORM for database operations; never write raw SQL in application code.
2. Validate all inputs with Zod schemas before database operations.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
