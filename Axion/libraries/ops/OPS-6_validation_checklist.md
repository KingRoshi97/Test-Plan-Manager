---
library: ops
id: OPS-6c
schema_version: 1.0.0
status: draft
---

# OPS-6c — Validation Checklist

- [ ] OPS-GATE-01 through OPS-GATE-06 all defined and mapped to pipeline stages
- [ ] Each sub-gate has defined inputs, pass condition, and evidence output
- [ ] Gate evaluation order is deterministic (numeric order)
- [ ] Failure in any sub-gate produces actionable evidence with remediation
- [ ] Evidence blocks include artifact paths, validation results, and remediation guidance
- [ ] Gate mapping references correct ops registry entries (ALRT-01, LTS-01, SLO-01, PERF-01, COST-01)
- [ ] All referenced schemas exist in ops/schemas/
- [ ] Cross-reference integrity between gates and ops registry verified
