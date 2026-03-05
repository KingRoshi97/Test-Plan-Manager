---
library: canonical
id: CAN-6a
schema_version: 1.0.0
status: draft
---

# CAN-6a — Mapping to Pipeline Gates

Pipeline gate: **G2_CANONICAL_INTEGRITY**

G2 passes if:
- CAN-GATE-01..05 pass
- CAN-GATE-06 satisfies risk-class policy (blocking unknowns handled)

Risk-class rule (default):
- PROTOTYPE: blocking unknowns produce warn/pause (configurable)
- PROD: blocking unknowns → pause until resolved or approved override
- COMPLIANCE: blocking unknowns → hard stop (default)
