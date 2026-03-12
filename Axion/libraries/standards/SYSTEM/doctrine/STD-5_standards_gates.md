---
library: standards
id: STD-5
schema_version: 1.0.0
status: draft
---

# STD-5 — Standards Gates

## Purpose
Ensure standards resolution (S3) produced a valid, deterministic snapshot and that downstream
stages are operating on pinned standards.

## Gate set (minimum)

### STD-GATE-01 — Standards index pinned + valid
- standards_index is pinned (via SYS pins)
- standards_index validates against standards_index.v1

### STD-GATE-02 — All referenced packs exist + validate
- each selected pack path exists
- each pack validates against standards_pack.v1

### STD-GATE-03 — Resolver produced snapshot
- STANDARDS_SNAPSHOT exists
- snapshot validates against standards_snapshot.v1

### STD-GATE-04 — Snapshot pack ordering deterministic
- snapshot.resolved_packs matches STD-3 resolver output order
- snapshot.resolved_rules ordering is deterministic (pack order → rule order)

### STD-GATE-05 — Conflicts handled deterministically
- if conflicts exist:
  - they are recorded in snapshot.conflicts
  - resolution mode is deterministic (most_restrictive / require_approval / fail)
  - for require_approval: policy hook decision exists in run manifest
### STD-GATE-06 — Snapshot pinned in run manifest
- run manifest includes artifact entry for STANDARDS_SNAPSHOT
- downstream stages reference the pinned snapshot (not "latest")
