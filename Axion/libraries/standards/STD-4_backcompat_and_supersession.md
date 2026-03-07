---
library: standards
doc_id: STD-4_backcompat_and_supersession
title: Backward Compatibility and Supersession
version: 1.0.0
status: draft
---

# STD-4 — Backward Compatibility and Supersession

## Purpose

Defines the rules for maintaining backward compatibility when standards change, the mechanics of supersession chains, and the migration paths that consumers must follow.

## Backward Compatibility Rules

### SemVer Contract

Standard units follow SemVer semantics for their `version` field:

| Change Type | Version Bump | Backward Compatible |
|---|---|---|
| Additive rule (new optional requirement) | MINOR | Yes |
| Documentation or metadata correction | PATCH | Yes |
| Rule removal or relaxation | MINOR | Yes |
| Rule tightening (stricter requirement) | MAJOR | No |
| Applicability scope expansion | MINOR | Yes |
| Applicability scope narrowing | MAJOR | No |
| Dependency edge addition | MINOR | Yes |
| Dependency edge removal | MAJOR | No |

### Compatibility Guarantees

1. **PATCH versions** MUST NOT change enforcement behavior.
2. **MINOR versions** MUST NOT break existing compliant artifacts.
3. **MAJOR versions** MAY break existing compliance; a migration path MUST be provided.
4. Active consumers pinned to `^MAJOR.0.0` will not receive breaking changes.

### Deprecation Period

Before a MAJOR version change:

1. The current version MUST be marked `deprecated` for at least one release cycle.
2. Deprecation warnings MUST appear in decision reports.
3. The successor unit MUST be published and available before the predecessor is deprecated.

## Supersession Chains

A supersession chain links a sequence of standard units where each unit replaces its predecessor.

### Chain Structure

```
STDU-ALPHA-v1 ──superseded_by──► STDU-ALPHA-v2 ──superseded_by──► STDU-BETA-v1
```

| Field | Location | Description |
|---|---|---|
| `superseded_by` | predecessor unit | Points to the successor `unit_id`. |
| `supersedes` | successor unit | Points to the predecessor `unit_id`. |
| `supersession_reason` | successor unit | Why the predecessor was replaced. |
| `supersession_date` | successor unit | ISO-8601 date when supersession took effect. |

### Chain Rules

1. A unit MUST NOT supersede itself.
2. Chains MUST be acyclic.
3. A chain MUST terminate at exactly one `active` unit (the head).
4. All non-head units in a chain MUST have status `superseded` or `retired`.
5. Forking (one unit superseded by multiple successors) is forbidden; use compatibility declarations instead.

### Chain Traversal

- **Forward**: From any unit, follow `superseded_by` to find the current active head.
- **Backward**: From the head, follow `supersedes` to reconstruct the full history.
- **Resolution**: The standards resolver MUST always resolve to the chain head unless an explicit version pin overrides.

## Migration Paths

When a standard is superseded, the successor MUST include a migration path:

```json
{
  "migration_path": {
    "from_unit_id": "STDU-AUTH_BASELINE",
    "from_version": "1.x",
    "to_unit_id": "STDU-AUTH_BASELINE_V2",
    "to_version": "2.0.0",
    "steps": [
      "Update gate references from GATE-AUTH-001 to GATE-AUTH-002.",
      "Add proof requirement PROOF-MFA for all COMPLIANCE risk class contexts.",
      "Remove deprecated rule RULE-WEAK_PASSWORD_ALLOW."
    ],
    "breaking_changes": [
      "RULE-WEAK_PASSWORD_ALLOW removed; all contexts now require strong passwords.",
      "GATE-AUTH-001 no longer satisfies this standard."
    ],
    "automated": false,
    "tooling_ref": null
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `from_unit_id` | string | yes | The predecessor unit. |
| `from_version` | string | yes | Version range being migrated from. |
| `to_unit_id` | string | yes | The successor unit. |
| `to_version` | string | yes | Target version. |
| `steps` | string[] | yes | Ordered migration steps. |
| `breaking_changes` | string[] | yes | List of breaking changes. |
| `automated` | boolean | yes | Whether migration can be performed automatically. |
| `tooling_ref` | string | no | Reference to migration tooling if automated. |

## Validation Rules

1. Every MAJOR version bump MUST have a corresponding migration path.
2. Supersession chains MUST be acyclic and terminate at one active head.
3. Deprecated units MUST have `superseded_by` populated within one release cycle.
4. Migration paths MUST list all breaking changes.
5. The resolver MUST emit a warning when resolving a deprecated unit.
