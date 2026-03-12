---
library: standards
id: STD-3
schema_version: 1.0.0
status: draft
---

# STD-3 — Standards Resolution Model

## Purpose
When multiple standards packs apply, resolution produces a single ordered "resolved set" with
deterministic precedence.

## Resolution outputs
- resolved_pack_list (ordered)
- resolved_rules (ordered)
- conflicts (if any)
- final snapshot artifact (STD-4)

## Inputs
- standards_index (pinned)
- all referenced packs (pinned)
- run context:
  - profile_id
  - risk_class
  - stack signals
  - canonical domains/capabilities
