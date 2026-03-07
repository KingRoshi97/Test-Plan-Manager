---
library: intake
id: INT-4-GOV
schema_version: 1.0.0
status: draft
---

# INT-4-GOV — Backward Compatibility and Migration

## Purpose

Defines the backward compatibility contract for intake form changes, field deprecation policies, and migration paths. Ensures that form evolution does not break existing submissions or downstream consumers.

## Compatibility Guarantee

| Change Type | Compatibility | Requires Migration |
|---|---|---|
| Add optional field | Backward compatible | No |
| Add required field | Breaking | Yes |
| Remove field | Breaking | Yes |
| Rename field_id | Breaking | Yes |
| Change field type | Breaking | Yes |
| Add enum option | Backward compatible | No |
| Remove enum option | Breaking | Yes |
| Add alias to enum | Backward compatible | No |
| Change canonical mapping | Breaking | Yes |
| Change validation rule | Potentially breaking | Case-by-case |
| Reorder pages/fields | Backward compatible | No |

## Field Deprecation Policy

1. Fields MUST be marked as `deprecated` for at least one form version before removal.
2. Deprecated fields:
   - MUST retain their `field_id` unchanged
   - MUST have `required` set to `false`
   - SHOULD include `deprecation_notice` in `help_text`
   - MUST still be accepted in submissions
3. Deprecated fields are excluded from new submission UIs but remain valid in API submissions.

## Migration Record Format

Each migration is recorded as:

```json
{
  "migration_id": "MIG-001",
  "from_version": "1.0.0",
  "to_version": "1.1.0",
  "changes": [
    {
      "action": "add_field",
      "field_id": "F-NEW_FIELD",
      "details": "Added optional field for deployment region"
    },
    {
      "action": "deprecate_field",
      "field_id": "F-OLD_FIELD",
      "replacement": "F-NEW_FIELD",
      "details": "Replaced by more specific field"
    }
  ],
  "backfill_strategy": "default_value",
  "rollback_safe": true
}
```

## Migration Actions

| Action | Description |
|---|---|
| `add_field` | New field added to form spec |
| `remove_field` | Field removed (must have been deprecated) |
| `deprecate_field` | Field marked as deprecated |
| `rename_field` | Field ID changed (old ID aliased) |
| `change_type` | Field type changed |
| `change_mapping` | Canonical mapping updated |
| `add_enum_option` | New option added to enum |
| `remove_enum_option` | Option removed from enum |
| `add_validation` | New validation rule added |
| `remove_validation` | Validation rule removed |

## Backfill Strategies

| Strategy | Description |
|---|---|
| `default_value` | Apply a default value to existing submissions |
| `derive` | Compute value from other fields |
| `null` | Leave as null/absent in existing submissions |
| `manual` | Requires operator to backfill |

## Governance Rules

1. Every breaking change MUST have a migration record.
2. Migration records are append-only and immutable.
3. Form version MUST be incremented for any breaking change.
4. Rollback safety MUST be documented for each migration.
5. Deprecated fields MUST remain in the schema for at least one version cycle.
