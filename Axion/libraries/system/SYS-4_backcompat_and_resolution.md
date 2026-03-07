---
library: system
id: SYS-4-GOV
schema_version: 1.0.0
status: draft
---

# SYS-4 — Backward Compatibility and Resolution

## Purpose

This doctrine defines backward compatibility guarantees for system-level changes, the resolver
authority contract, and deterministic loader behavior. It ensures that system evolution does not
break existing runs or downstream consumers.

## Backward Compatibility Guarantees

### Schema Compatibility

- **Additive changes** (new optional fields) are always backward compatible.
- **Removing required fields** is a breaking change requiring a major version bump.
- **Changing field types** is a breaking change.
- **Renaming fields** is a breaking change; use deprecation + new field instead.

### Contract Compatibility

- A new version of a system contract must accept all inputs valid under the previous version.
- Output shape changes must be additive; existing fields retain their semantics.
- Deprecation requires a minimum two-version notice period before removal.

### Migration Path

When a breaking change is unavoidable:

1. Publish the new contract version alongside the old one.
2. Mark the old version as `deprecated` with a `sunset_date`.
3. Provide a migration guide in the contract changelog.
4. Remove the old version only after the sunset date and after all active pins have migrated.

## Resolver Authority Contract

The resolver is the single authority for determining which version of a system artifact is
active during a run. Its guarantees:

| Guarantee | Description |
|---|---|
| **Single source of truth** | Only the resolver may select artifact versions |
| **Pin supremacy** | Explicit pins always override floating resolution |
| **Determinism** | Given identical inputs, the resolver always produces identical outputs |
| **Fail-closed** | If resolution is ambiguous, the resolver fails rather than guessing |
| **Auditability** | Every resolution decision is recorded in the system decision report |

### Resolver Inputs

The resolver accepts:

- Workspace configuration (pins, policies, defaults)
- Project overrides
- Profile-level constraints
- Run-level parameters

Resolution follows the precedence chain: run > profile > project > workspace > system defaults.

## Deterministic Loader Behavior

The loader is responsible for reading resolved artifacts from storage. Its contracts:

1. **Idempotent reads** — Loading the same artifact version always returns identical content.
2. **Atomic loading** — An artifact is either fully loaded or not loaded at all; no partial state.
3. **Integrity verification** — Loaded content is verified against stored checksums.
4. **Cache coherence** — Cached artifacts are invalidated when the underlying version changes.
5. **Error surfacing** — Load failures produce explicit errors with artifact ID, version, and cause.

### Loader Sequence

1. Receive resolved artifact reference from the resolver.
2. Check local cache for matching version + checksum.
3. If cache miss, fetch from storage.
4. Verify content integrity (checksum match).
5. Return artifact content or explicit error.
