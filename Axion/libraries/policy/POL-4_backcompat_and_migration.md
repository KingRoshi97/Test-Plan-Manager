---
library: policy
doc_id: POL-4-GOV
title: Backward Compatibility and Migration
version: 1.0.0
status: draft
---

# POL-4-GOV — Backward Compatibility and Migration

## Purpose

Policy changes affect every run. This doctrine defines how policy units evolve
without breaking in-flight runs or invalidating historical decision reports.

## Versioning Rules

1. **Patch** (1.0.x) — documentation or metadata changes only; no behavioral
   impact.
2. **Minor** (1.x.0) — additive changes (new optional fields, relaxed
   constraints); existing runs unaffected.
3. **Major** (x.0.0) — breaking changes (removed fields, tightened constraints,
   renamed identifiers); requires migration.

## Migration Protocol

When a major version is released:

1. **Announce** — the new version is published with status `draft` alongside the
   existing `active` version.
2. **Parallel evaluation** — both versions are evaluated during a transition
   window; the old version remains authoritative.
3. **Cutover** — the new version transitions to `active`; the old version
   transitions to `deprecated`.
4. **Sunset** — after a grace period, the old version transitions to
   `superseded`.

### Transition Windows by Risk Class

| Risk Class  | Minimum Transition Window |
|-------------|--------------------------|
| PROTOTYPE   | 0 days (immediate)        |
| PROD        | 14 days                   |
| COMPLIANCE  | 30 days                   |

## Historical Integrity

- Decision reports always reference the exact policy unit version evaluated.
- Archived policy units remain readable and resolvable by ID + version.
- No retroactive re-evaluation of past reports against new policy versions.

## Registry Updates

When a policy unit version changes, the policy registry
(`policy_registry.v1.json`) is updated to reflect the new version and status.
The old entry is preserved with its final status.
