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
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:DB_MODELS -->
## Data Models & Tables
- Table list (name → purpose → owner): [TBD]
- Relationships + cardinality notes: [TBD]


<!-- AXION:SECTION:DB_CONSTRAINTS -->
## Constraints & Integrity
- Primary keys strategy: [TBD]
- Uniqueness constraints: [TBD]
- Foreign keys and cascade rules: [TBD]


<!-- AXION:SECTION:DB_MIGRATIONS -->
## Migrations & Change Management
- Migration tool/process: [TBD]
- Forward/backward compatibility approach: [TBD]
- Zero-downtime migration rules: [TBD]


<!-- AXION:SECTION:DB_INDEXING -->
## Indexing & Query Performance
- Index strategy: [TBD]
- Known hot queries and plans: [TBD]


<!-- AXION:SECTION:DB_RETENTION -->
## Retention, Archival, Deletion
- Retention rules: [TBD]
- Deletion policy (privacy): [TBD]


<!-- AXION:SECTION:DB_BACKUP_DR -->
## Backup & Disaster Recovery
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


## Agent Rules

1. [TBD] - Define agent constraints.
2. [TBD] - Define agent behaviors.

## ACCEPTANCE
- [ ] All [TBD] placeholders populated


## OPEN_QUESTIONS
- [TBD] - List unresolved questions
