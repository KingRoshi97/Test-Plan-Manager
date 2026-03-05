---
library: intake
id: INT-6a
schema_version: 1.0.0
status: draft
---

# INT-6a — Mapping to Pipeline Gates

Pipeline gate: **G1_INTAKE_VALIDITY**

G1 passes if:
- INT-GATE-01..06 all pass

G1 fails/pause if:
- any INT-GATE hard rule fails
- output must include intake_validation_report with error list + pointers
