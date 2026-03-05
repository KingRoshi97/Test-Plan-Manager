---
library: canonical
id: CAN-6c
schema_version: 1.0.0
status: draft
---

# CAN-6c — Evidence Requirements (Canonical Failures)

For any failure, evidence must include:
- failing gate_id
- entity_id/rel_id list (when applicable)
- pointers to canonical_spec locations (JSON pointers)
- pointers to unknown_assumptions entries (when applicable)
- remediation:
  - fix builder rules
  - resolve unknown via intake update
  - rerun S4 and downstream stages
