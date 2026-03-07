---
library: verification
id: VER-4_backcompat_and_reuse
schema_version: 1.0.0
status: draft
---

# VER-4 — Backward Compatibility and Proof Reuse

## Purpose

Defines rules for maintaining backward compatibility when proof schemas or types change, and establishes the model for reusable proof bundles in maintenance and incremental delivery modes.

## Backward Compatibility Rules

### Schema Evolution

- New optional fields may be added to proof unit schemas without a version bump
- Removing or renaming required fields requires a new schema version
- Consumers must tolerate unknown fields (open-world assumption)
- Deprecated fields must be preserved for at least one major version cycle

### Proof Type Changes

- New proof types may be added to the registry at any time
- Existing proof types must not be removed while active proofs reference them
- Proof type `required_fields` may be extended (additive only) without breaking existing proofs
- Reducing `required_fields` requires a new proof type version

### Migration Path

When a breaking change is necessary:

1. Publish the new schema/type version alongside the old one
2. Mark the old version as `deprecated` with a `sunset_date`
3. Provide a migration guide or automated transform
4. After sunset, old proofs remain readable but new proofs must use the new version

## Reusable Proof Bundles

### Concept

A **proof bundle** is a named, versioned collection of proof units that can be reused across runs. Bundles are useful for maintenance modes where the same verifications apply repeatedly.

### Bundle Structure

| Field | Type | Required | Description |
|---|---|---|---|
| `bundle_id` | string | yes | Unique identifier for the bundle |
| `bundle_version` | string | yes | Semantic version of the bundle |
| `proof_ids` | array | yes | List of proof unit IDs included |
| `valid_from` | datetime | yes | Start of validity window |
| `valid_until` | datetime | no | End of validity window (null = no expiry) |
| `reuse_scope` | enum | yes | `maintenance`, `hotfix`, `incremental`, `full` |
| `conditions` | array | no | Conditions under which the bundle is valid |

### Reuse Scopes

| Scope | Meaning |
|---|---|
| `maintenance` | Bundle valid for routine maintenance runs with no functional changes |
| `hotfix` | Bundle valid for hotfix runs that do not alter verified behavior |
| `incremental` | Bundle valid for incremental additions that do not invalidate existing proofs |
| `full` | Bundle valid for any run (rare; requires evergreen proofs) |

### Invalidation Rules

A proof bundle is invalidated when:

- Any proof unit in the bundle changes status to `fail` or `expired`
- The underlying code, config, or dependency covered by a proof changes
- The bundle's `valid_until` date passes
- A policy change raises the minimum required strength tier above the bundle's proofs

### Bundle Lifecycle

1. **Create** — assemble proof IDs after a successful verification pass
2. **Register** — add to verification registry with validity metadata
3. **Reuse** — reference bundle in subsequent runs; engine checks validity
4. **Invalidate** — mark bundle as invalid when conditions change
