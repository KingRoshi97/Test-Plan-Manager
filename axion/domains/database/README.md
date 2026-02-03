<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:database -->
<!-- AXION:PREFIX:db -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Database — AXION Module Template

**Module slug:** `database`  
**Prefix:** `db`  
**Description:** Database schema, migrations, and data models for Axion Assembler

> Populated during AXION draft stage based on user input.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: Single-tenant (one instance per workspace) (source: RPBS §21 Tenancy / Organization Model)
- Actors & Permission Intents: Admin (full access), User (view/execute) (source: RPBS §3 Actors & Permission Intents)
- Core Objects impacted here: Assembly, Run, ArtifactIndex (source: RPBS §4 Core Objects Glossary)
- Non-Functional Profile implications: Standard latency, small scale tier (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A — not a billing application (source: RPBS §14)
  - Notifications: N/A — no notification system (source: RPBS §11)
  - Uploads/Media: N/A — file handling via filesystem (source: RPBS §13)
  - Public API: N/A — internal API only (source: RPBS §22)
- Privacy Controls (Deletion/Export): Yes — assemblies can be deleted (source: RPBS §29)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:DB_SCOPE -->
## Scope & Ownership
- Owns: Database schema definitions, Drizzle ORM models, migrations, entity relationships
- Does NOT own: File system operations, AXION script execution, registry JSON files

<!-- AXION:SECTION:DB_MODELS -->
## Data Models & Tables

### Assembly Table
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Assembly name |
| description | TEXT | Optional description |
| workspace_path | VARCHAR(500) | Path to AXION workspace |
| selected_preset | VARCHAR(100) | Preset from presets.json |
| selected_plan | VARCHAR(50) | Stage plan (scaffold/docs/full/release) |
| selected_stack_profile | VARCHAR(100) | Stack profile from REBS |
| last_run_id | UUID (nullable) | FK to most recent Run |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### Run Table
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| assembly_id | UUID | FK to Assembly |
| stage | ENUM | (init/generate/seed/draft/review/verify/lock/package) |
| mode | ENUM | (all/module) |
| module | VARCHAR(50) (nullable) | Module slug if mode=module |
| status | ENUM | (queued/running/success/failed/blocked_by) |
| started_at | TIMESTAMP | Execution start |
| finished_at | TIMESTAMP (nullable) | Execution end |
| stdout | TEXT | Captured stdout |
| stderr | TEXT | Captured stderr |
| json_result | JSONB | Parsed JSON output |
| exit_code | INTEGER | Process exit code |
| next_commands | JSONB | Suggested next commands |
| created_at | TIMESTAMP | Record creation |

### ArtifactIndex Table
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| assembly_id | UUID | FK to Assembly |
| stage_markers_path | VARCHAR(500) | Path to stage_markers.json |
| verify_status_path | VARCHAR(500) | Path to verify_status.json |
| verify_report_path | VARCHAR(500) | Path to verify_report.json |
| erc_directory_path | VARCHAR(500) | Path to ERC outputs |
| template_hash_path | VARCHAR(500) | Path to template hashes |
| proposals_path | VARCHAR(500) | Path to proposals |
| export_kit_history_path | VARCHAR(500) | Path to export history |
| updated_at | TIMESTAMP | Last sync time |

### Export Table
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| assembly_id | UUID | FK to Assembly |
| filename | VARCHAR(255) | ZIP filename |
| file_path | VARCHAR(500) | Full path to ZIP |
| manifest | JSONB | Exported manifest.json |
| created_at | TIMESTAMP | Export creation time |

- Relationships + cardinality notes:
  - Assembly 1:N Run (one assembly has many runs)
  - Assembly 1:1 ArtifactIndex (one assembly has one artifact index)
  - Assembly 1:N Export (one assembly has many exports)

<!-- AXION:SECTION:DB_CONSTRAINTS -->
## Constraints & Integrity
- Primary keys strategy: UUID v4 generated via `gen_random_uuid()`
- Uniqueness constraints: 
  - Assembly.name must be unique
  - Assembly.workspace_path must be unique
- Foreign keys and cascade rules:
  - Run.assembly_id → Assembly.id (ON DELETE CASCADE)
  - ArtifactIndex.assembly_id → Assembly.id (ON DELETE CASCADE)
  - Export.assembly_id → Assembly.id (ON DELETE CASCADE)

<!-- AXION:SECTION:DB_MIGRATIONS -->
## Migrations & Change Management
- Migration tool/process: Drizzle Kit (`npm run db:push` for dev, `npm run db:migrate` for production)
- Forward/backward compatibility approach: Schema-first with Drizzle, additive changes preferred
- Zero-downtime migration rules: Use additive migrations; avoid column renames; use nullable columns for new fields

<!-- AXION:SECTION:DB_INDEXING -->
## Indexing & Query Performance
- Index strategy:
  - B-tree index on Run.assembly_id for efficient run lookups
  - B-tree index on Run.status for queue processing
  - B-tree index on Run.created_at for chronological ordering
- Known hot queries and plans:
  - List runs by assembly (ordered by created_at DESC)
  - Get latest run per assembly (WHERE assembly_id = ? ORDER BY created_at DESC LIMIT 1)
  - Get pending/running runs (WHERE status IN ('queued', 'running'))

<!-- AXION:SECTION:DB_RETENTION -->
## Retention, Archival, Deletion
- Retention rules: Runs retained indefinitely for audit trail; exports retained until manually deleted
- Deletion policy (privacy): When assembly is deleted, cascade deletes all runs, artifacts, and exports

<!-- AXION:SECTION:DB_BACKUP_DR -->
## Backup & Disaster Recovery
- Backup cadence + RPO/RTO: Daily backups recommended; RPO 24h; RTO 1h
- Restore validation process: Periodic restore tests to staging environment

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
