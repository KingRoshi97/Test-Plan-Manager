---
library: audit
id: AUD-1-GOV
title: Audit Unit Model
schema_version: 1.0.0
status: draft
---

# AUD-1 — Audit Unit Model

## Purpose

Every audit entry is a **governed unit**. This doctrine defines the structure, identity, mutation lifecycle, blast radius classification, and backward-compatibility assessment for audit units.

## Audit Unit Identity

| Field | Type | Description |
|---|---|---|
| `audit_unit_id` | string | Globally unique identifier for the audit unit. Pattern: `AUD-UNIT-<ULID>`. |
| `schema_ref` | string | Reference to the schema version that governs this unit. |
| `created_at` | ISO 8601 | Timestamp of initial creation. |
| `last_mutated_at` | ISO 8601 | Timestamp of the most recent mutation. |

## Mutation Classes

Each audit unit progresses through a governed mutation lifecycle:

| Mutation Class | Semantics |
|---|---|
| `create` | Initial creation of the audit unit. Immutable once written unless superseded. |
| `revise` | Non-breaking amendment (e.g., adding optional metadata). Prior version remains valid. |
| `supersede` | A new unit replaces the prior unit. The old unit is marked `superseded_by` with a forward pointer. |
| `deprecate` | Unit is flagged for future removal. Consumers receive deprecation notice. No new references allowed. |
| `retire` | Unit is permanently sealed. No further reads except for archival/compliance queries. |

### Mutation Rules

- `create` and `revise` are append-only operations on the audit ledger.
- `supersede` requires both the old and new `audit_unit_id` to be recorded atomically.
- `deprecate` must include a `deprecation_reason` and `sunset_date`.
- `retire` is irreversible and must pass retention-policy checks before execution.

## Blast Radius

Blast radius classifies how widely a mutation to an audit unit affects downstream consumers.

| Blast Radius | Scope | Example |
|---|---|---|
| `local` | Affects only the originating library or run context. | Correcting a typo in an audit reason field. |
| `cross-library` | Affects consumers in other libraries that reference this audit unit. | Superseding an audit entry referenced by a gate report. |
| `system-wide` | Affects all consumers, dashboards, compliance exports. | Schema-level mutation that changes required fields. |

### Blast Radius Assessment

Before any mutation of class `supersede`, `deprecate`, or `retire`:

1. Enumerate all inbound references to the audit unit.
2. Classify the blast radius.
3. If `cross-library` or `system-wide`, require explicit operator approval.

## Backward Compatibility Result

Every mutation must produce a `backcompat_result`:

| Result | Meaning |
|---|---|
| `compatible` | Existing consumers require no changes. |
| `migration_required` | Consumers must update references or parsers within the deprecation window. |
| `breaking` | Immediate consumer breakage. Requires coordinated rollout and versioned schema bump. |

### Compatibility Evaluation

- Adding optional fields → `compatible`.
- Renaming or removing required fields → `breaking`.
- Changing enum values → `migration_required` if additive, `breaking` if subtractive.
- Changing `audit_unit_id` format → `breaking`.

## Schema Reference

Audit units conform to `axion://schemas/audit/audit_unit.v1`.

## Registry Reference

Governed audit units are tracked in `audit_registry.v1.json`.
