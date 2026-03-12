---
library: standards
id: STD-5d
schema_version: 1.0.0
status: draft
---

# STD-5d — Determinism Rules (Standards Gates)

- Gates run in fixed order STD-GATE-01..06.
- Output is stable given pinned inputs.
- Policy-controlled outcomes must reference pinned policy_set_id + decision_id.
- Evidence pointers are deterministic and path-based (hash optional).
