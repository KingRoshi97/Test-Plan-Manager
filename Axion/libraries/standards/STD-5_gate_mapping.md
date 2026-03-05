---
library: standards
id: STD-5a
schema_version: 1.0.0
status: draft
---

# STD-5a — Mapping to Pipeline Gate

Pipeline gate: **G3_STANDARDS_RESOLVED**

G3 passes if:
- STD-GATE-01..04 pass
- STD-GATE-05 passes (or is policy-approved when required)
- STD-GATE-06 passes

Default behavior:
- PROTOTYPE: conflicts may warn/pause (configurable)
- PROD: conflicts require approval or fail
- COMPLIANCE: conflicts fail by default
