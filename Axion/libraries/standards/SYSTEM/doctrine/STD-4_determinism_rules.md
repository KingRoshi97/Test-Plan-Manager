---
id: STD-4a
library: standards
schema_version: 1.0.0
status: draft
---

# STD-4a — Determinism Rules (Snapshot)

- resolved_packs order must equal STD-3 resolved pack list.
- resolved_rules order must equal:
  pack precedence order, then rule array order inside each pack.
- snapshot_id is generated deterministically from:
  pipeline version + resolved pack refs + run_id (or from pack refs only, if you want cross-run
stable snapshots).
- conflicts (if present) must be ordered deterministically by conflict_id (or by pack_id/rule_id
pairs).
- Snapshot is pinned in run manifest and treated as read-only.
