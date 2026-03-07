---
doc_id: MNT-11
title: "Registry Rebuild Integrity"
library: maintenance
version: "0.1.0"
status: active
---

# MNT-11: Registry Rebuild Integrity

## Purpose

Defines the integrity constraints and validation rules for rebuilding Axion registries. This doctrine governs maintenance mode MM-12 (Rebuild Indexes/Registries) and MM-13 (Registry Integrity Cleanup).

## Integrity Invariants

| Invariant ID | Rule |
|--------------|------|
| RBI-01 | A rebuilt registry must contain every entry present in the source-of-truth artifacts |
| RBI-02 | No phantom entries: every registry entry must correspond to an existing artifact on disk |
| RBI-03 | Entry ordering must be deterministic (sorted by primary key) |
| RBI-04 | Registry `version` field must be incremented on every rebuild |
| RBI-05 | The `$id` or `registry_id` field must remain stable across rebuilds |
| RBI-06 | Schema references (`$ref`, `schema_id`) must resolve after rebuild |

## Rebuild Procedure

1. **Pre-Rebuild Snapshot**: Create a snapshot (MM-16) of the current registry state.
2. **Source Scan**: Enumerate all source artifacts that feed the registry.
3. **Entry Generation**: Generate registry entries from source artifacts applying canonical transforms.
4. **Diff Computation**: Compare generated entries against the pre-rebuild snapshot.
5. **Integrity Validation**: Verify all invariants (RBI-01 through RBI-06).
6. **Conflict Resolution**: Flag any entries present in snapshot but missing from source scan as potential orphans.
7. **Apply**: Write the rebuilt registry only after all invariants pass and consent gate G-MUS-01 is satisfied.

## Orphan Handling

Orphan entries (present in registry but missing source artifact) must be:

- Flagged as findings with severity `warning`
- Retained in the registry with status `orphan` until manual review
- Never silently deleted during automated rebuilds

## Post-Rebuild Validation

After a registry rebuild, run MM-01 (Health Check) to confirm the rebuilt registry passes all health dimensions defined in MNT-8.
