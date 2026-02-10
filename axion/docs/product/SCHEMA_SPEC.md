# Schema Specification

> **Level 0 — Data Truth.** This document defines every persistent entity, its fields, relationships, and constraints. It is the authoritative source for database design and must align with RPBS §4 (Core Objects), §8 (Data Classification), and §21 (Tenancy Model).

## How to Use This Template

1. **Derive from RPBS.** Every entity here must trace back to an object in RPBS §4 (Core Objects Glossary). If you add an entity not in RPBS, add it there first.
2. **Fill placeholders.** Replace `{{PLACEHOLDER}}` with real schema data. If unknown, write `UNKNOWN` and add to OPEN_QUESTIONS.
3. **Add or remove entities.** The template shows the minimum structure. Add entity sections as needed; delete ones that don't apply.
4. **Cross-reference REBS §5.** Data modeling standards (UUID keys, timestamps, soft delete, null handling) are defined in REBS and must be followed here.
5. **Cascade order.** This document is filled after RPBS and REBS. The seed step uses Core Objects and engineering defaults to pre-populate fields.

---

## Document Info

**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Status:** Draft | Review | Approved

---

## 1) Entity Definitions

Define every persistent entity. One subsection per entity.

### Entity: {{ENTITY_NAME_1}}

| Field | Type | Required | Default | Constraints | Notes |
|-------|------|----------|---------|-------------|-------|
| id | UUID | Yes | `gen_random_uuid()` | PK | |
| {{FIELD_1}} | {{TYPE_1}} | Yes/No | {{DEFAULT_1}} | {{CONSTRAINTS_1}} | |
| {{FIELD_2}} | {{TYPE_2}} | Yes/No | {{DEFAULT_2}} | {{CONSTRAINTS_2}} | |
| created_at | timestamp | Yes | `now()` | NOT NULL | Auto-set |
| updated_at | timestamp | Yes | `now()` | NOT NULL | Auto-updated |

**RPBS Source:** §4 — {{OBJECT_NAME}}
**Owned By:** {{ACTOR}}
**Soft Delete:** Yes | No (align with REBS §5)

### Entity: {{ENTITY_NAME_2}}

| Field | Type | Required | Default | Constraints | Notes |
|-------|------|----------|---------|-------------|-------|
| id | UUID | Yes | `gen_random_uuid()` | PK | |
| {{FIELD_1}} | {{TYPE_1}} | Yes/No | {{DEFAULT_1}} | {{CONSTRAINTS_1}} | |
| created_at | timestamp | Yes | `now()` | NOT NULL | Auto-set |
| updated_at | timestamp | Yes | `now()` | NOT NULL | Auto-updated |

**RPBS Source:** §4 — {{OBJECT_NAME}}
**Owned By:** {{ACTOR}}
**Soft Delete:** Yes | No

> **Rule:** Every entity must have a corresponding entry in RPBS §4. Orphan entities (no RPBS source) must be flagged as OPEN_QUESTIONS.

---

## 2) Relationships

| Relationship | From Entity | To Entity | Cardinality | FK Column | On Delete | Notes |
|-------------|-------------|-----------|-------------|-----------|-----------|-------|
| {{REL_NAME_1}} | {{FROM_1}} | {{TO_1}} | 1:N / N:1 / 1:1 / N:N | {{FK_1}} | CASCADE / SET NULL / RESTRICT | |
| {{REL_NAME_2}} | {{FROM_2}} | {{TO_2}} | 1:N / N:1 / 1:1 / N:N | {{FK_2}} | CASCADE / SET NULL / RESTRICT | |

### Many-to-Many Join Tables

If any relationship is N:N, define the join table here.

#### Join: {{JOIN_TABLE_NAME}}

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| {{ENTITY_A}}_id | UUID | Yes | FK → {{ENTITY_A}}.id | |
| {{ENTITY_B}}_id | UUID | Yes | FK → {{ENTITY_B}}.id | |
| created_at | timestamp | Yes | NOT NULL | |

**Composite PK:** ({{ENTITY_A}}_id, {{ENTITY_B}}_id)

> **Rule:** Every relationship in RPBS §4 (Key Relationships column) must appear here. Missing relationships must be flagged.

---

## 3) Enums and Constants

| Enum Name | Values | Used By | Notes |
|-----------|--------|---------|-------|
| {{ENUM_1}} | {{VALUES_1}} | {{ENTITY_1}}.{{FIELD}} | |
| {{ENUM_2}} | {{VALUES_2}} | {{ENTITY_2}}.{{FIELD}} | |

> **Rule:** Use database-level enums or CHECK constraints for bounded value sets. Do not rely on application-level validation alone.

---

## 4) Indexes

| Index Name | Table | Columns | Type | Notes |
|-----------|-------|---------|------|-------|
| {{IDX_1}} | {{TABLE_1}} | {{COLS_1}} | btree / unique / gin | |
| {{IDX_2}} | {{TABLE_2}} | {{COLS_2}} | btree / unique / gin | |

### Indexing Guidelines

- Add indexes for all foreign key columns
- Add indexes for fields used in WHERE clauses, ORDER BY, and search
- Use GIN indexes for array/JSONB columns if search is required (RPBS §12)
- Use unique indexes for natural keys and uniqueness constraints

> **Rule:** Every searchable field listed in RPBS §12 must have a corresponding index or be flagged as a performance risk.

---

## 5) Tenancy Scoping

> Only applicable if RPBS §21 tenancy is not `single-user`.

| Entity | Tenant Column | Isolation Level | Notes |
|--------|--------------|----------------|-------|
| {{ENTITY_1}} | {{TENANT_COL_1}} | row-level / schema-level | |
| {{ENTITY_2}} | {{TENANT_COL_2}} | row-level / schema-level | |

**Row-Level Security (RLS):** Enabled | Not Required
**Default Isolation:** row-level (FK to tenant/org table)

> **Rule:** If tenancy is team/org or multi-tenant, every user-facing entity must have a tenant scoping column. Entities without one must be explicitly marked as global/shared.

---

## 6) Audit Fields

> Only applicable if RPBS §16 audit logging is `Yes`.

| Entity | Auditable? | Audit Events | Notes |
|--------|-----------|-------------|-------|
| {{ENTITY_1}} | Yes/No | create, update, delete | |
| {{ENTITY_2}} | Yes/No | create, update, delete | |

### Audit Log Schema

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PK |
| actor_id | UUID | Yes | Who performed the action |
| action | varchar | Yes | create / update / delete |
| entity_type | varchar | Yes | Table name |
| entity_id | UUID | Yes | Row ID |
| changes | jsonb | No | Before/after diff |
| correlation_id | UUID | Yes | Request ID |
| created_at | timestamp | Yes | When it happened |

> **Rule:** Audit log records are append-only. No UPDATE or DELETE on the audit table (REBS §16).

---

## 7) Data Retention and Classification

> Derived from RPBS §8 (Data Classification & Retention).

| Entity | Data Category | Retention Period | Deletion Policy | Notes |
|--------|--------------|-----------------|----------------|-------|
| {{ENTITY_1}} | PII / Financial / Internal / Public | {{RETENTION_1}} | soft / hard | |
| {{ENTITY_2}} | PII / Financial / Internal / Public | {{RETENTION_2}} | soft / hard | |

### PII Fields

| Entity | Field | PII Type | Encryption Required | Redaction in Logs | Notes |
|--------|-------|----------|--------------------|--------------------|-------|
| {{ENTITY_1}} | {{FIELD_1}} | email / name / phone / address | Yes/No | Yes | |

> **Rule:** Every PII field must be listed here. Fields marked PII must follow REBS §6 logging redaction rules.

---

## 8) Migration Notes

### Initial Schema

The initial schema should be generated via ORM (Drizzle) using `db:push` for development (REBS §5).

### Migration Checklist

- [ ] All entities from RPBS §4 are represented
- [ ] All relationships from RPBS §4 are defined
- [ ] Indexes cover search fields from RPBS §12
- [ ] Tenant scoping matches RPBS §21
- [ ] Audit fields match RPBS §16
- [ ] Data retention matches RPBS §8
- [ ] No raw SQL migrations (REBS §5 policy)
- [ ] Enums use database-level constraints

---

## OPEN_QUESTIONS

| ID | Question | Why Needed | Impact | Owner | Status |
|----|----------|------------|--------|-------|--------|
| SQ-01 | {{QUESTION_1}} | {{WHY_1}} | {{IMPACT_1}} | User/Agent | Open |

> **Rule:** Any entity, field, or relationship marked UNKNOWN must have a corresponding OPEN_QUESTION.

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | | | |
| Product Owner | | | |
