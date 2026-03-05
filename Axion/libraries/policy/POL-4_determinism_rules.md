---
library: policy
id: POL-4b
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# POL-4b — Determinism Rules (Enforcement)

- Every hook point produces exactly one decision record (allow/deny/require_approval/degrade).
- Decisions are derived from pinned policy_set + explicit inputs only.
- Decisions are recorded in the run manifest before the system acts on them.
- If require_approval, the run must pause and emit APPROVAL_REQUIRED.
