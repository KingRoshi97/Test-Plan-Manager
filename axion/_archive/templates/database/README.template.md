<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:database -->
<!-- AXION:PREFIX:db -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Database — AXION Module Template (Blank State)

**Module slug:** `database`  
**Prefix:** `db`  
**Description:** Database schema, migrations, and data models

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: UNKNOWN (source: RPBS §21 Tenancy / Organization Model)
- Actors & Permission Intents: UNKNOWN (source: RPBS §3 Actors & Permission Intents)
- Core Objects impacted here: UNKNOWN (source: RPBS §4 Core Objects Glossary)
- Non-Functional Profile implications: UNKNOWN (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Privacy Controls (Deletion/Export): UNKNOWN (source: RPBS §29)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:DB_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the database module.
"Owns" = table schemas, migrations, indexes, constraints, data integrity rules, backup/restore procedures.
"Does NOT own" = business logic operating on data (backend module), API types (contracts module), query construction in handlers (backend module).
Common mistake: claiming ownership of ORM model behavior or service-layer data transformations — database owns the schema, not the queries. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:DB_MODELS -->
## Data Models & Tables
<!-- AGENT: Derive from RPBS §4 Core Objects Glossary + DDES entity details for this domain.
Table list = every table with: name, purpose, owning domain module (e.g., users table owned by auth module).
Relationships = foreign key relationships with cardinality (1:1, 1:N, M:N via join table), cascade behavior.
Common mistake: creating tables not traceable to a Core Object in RPBS §4, or missing join tables for M:N relationships. -->
- Table list (name → purpose → owner): [TBD]
- Relationships + cardinality notes: [TBD]


<!-- AXION:SECTION:DB_CONSTRAINTS -->
## Constraints & Integrity
<!-- AGENT: Derive from DDES relationships and entity definitions.
Primary keys = UUID vs auto-increment vs composite keys — pick one strategy and justify.
Uniqueness = which columns/combinations must be unique (e.g., email per tenant, slug per org).
Foreign keys = every FK with ON DELETE/ON UPDATE behavior (CASCADE, SET NULL, RESTRICT) — derive from DDES relationship semantics.
Common mistake: missing uniqueness constraints that BELS implies (e.g., "email must be unique" rule without a DB constraint). -->
- Primary keys strategy: [TBD]
- Uniqueness constraints: [TBD]
- Foreign keys and cascade rules: [TBD]


<!-- AXION:SECTION:DB_MIGRATIONS -->
## Migrations & Change Management
<!-- AGENT: Based on architecture module's ORM choice (e.g., Drizzle, Prisma, Knex).
Migration tool = which tool generates and runs migrations, where migration files live, naming conventions.
Forward/backward compatibility = can the app run with old schema during deploy? Expand-then-contract pattern for breaking changes.
Zero-downtime rules = no DROP COLUMN in same deploy as code removal, add nullable columns first, backfill then add NOT NULL.
Common mistake: writing destructive migrations (DROP TABLE/COLUMN) without a backfill or rollback plan. -->
- Migration tool/process: [TBD]
- Forward/backward compatibility approach: [TBD]
- Zero-downtime migration rules: [TBD]


<!-- AXION:SECTION:DB_INDEXING -->
## Indexing & Query Performance
<!-- AGENT: Based on RPBS §7 performance targets + expected query patterns from DIM exposed interfaces.
Index strategy = which columns get indexes (FKs, frequently filtered/sorted columns, unique constraints), composite index ordering.
Hot queries = the most frequent or latency-sensitive queries (e.g., "list user's orders sorted by date"), expected EXPLAIN plan, target response time.
Common mistake: over-indexing (indexes on every column) or under-indexing (no indexes on FK columns used in JOINs). -->
- Index strategy: [TBD]
- Known hot queries and plans: [TBD]


<!-- AXION:SECTION:DB_RETENTION -->
## Retention, Archival, Deletion
<!-- AGENT: Derive from RPBS §8 Data Retention Policy.
Retention rules = how long each data type is kept (e.g., logs 90 days, user data until deletion request, audit trail 7 years).
Deletion policy = hard delete vs soft delete per table, GDPR/privacy right-to-deletion implementation, cascading deletion across related tables.
Common mistake: soft-deleting everything without a hard-delete cleanup job — soft deletes accumulate and degrade query performance. -->
- Retention rules: [TBD]
- Deletion policy (privacy): [TBD]


<!-- AXION:SECTION:DB_BACKUP_DR -->
## Backup & Disaster Recovery
<!-- AGENT: Derive from RPBS §7 reliability requirements.
Backup cadence = how often (continuous WAL, daily snapshots, etc.), RPO (max data loss tolerance), RTO (max downtime tolerance).
Restore validation = how often restore is tested, automated vs manual restore process, who is responsible.
Common mistake: defining backup without testing restore — an untested backup is not a backup. -->
- Backup cadence + RPO/RTO: [TBD]
- Restore validation process: [TBD]


<!-- AXION:SECTION:DB_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Schema is enumerated
- [ ] Migration rules documented
- [ ] Backup/restore expectations specified


<!-- AXION:SECTION:DB_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
