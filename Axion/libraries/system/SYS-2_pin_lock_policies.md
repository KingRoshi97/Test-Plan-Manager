---
library: system
id: SYS-2
schema_version: 1.0.0
status: draft
---

# SYS-2 — Pin / Lock Policies

## Purpose
Pins/locks make runs reproducible by freezing which library assets are used (schemas, policies,
standards snapshots, templates, knowledge bundles, etc.).

## Definitions
- **Pin**: an explicit reference to a specific version of a library asset.
- **Lock**: an enforcement rule that forbids changing a pinned asset (or forbids "latest"
resolution).
- **Resolution**: mapping from logical asset name → concrete path + version.

## What can be pinned (pin targets)
Minimum pin targets:
- library_index version (global library resolution)
- schema_registry version (schema resolution)
- standards snapshot id
- template registry version + selected template ids
- knowledge selection artifact id (or bundle ids + resolved KID list)
- policy set id
- quota set id
- adapter profile id (capabilities baseline)

## Where pins live
Pins exist at three levels:
1) Workspace defaults (baseline pins)
2) Project bindings (override pins)
3) Run manifest pins (final, per-run)

## Determinism rule
A run is reproducible if its run manifest contains the fully resolved pins for all required targets.
