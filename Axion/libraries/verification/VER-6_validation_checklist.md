---
library: verification
id: VER-6d
schema_version: 1.0.0
status: draft
---

# VER-6d — Validation Checklist

- [ ] VER-GATE-01 through VER-GATE-07 all defined and mapped to G7_VERIFICATION
- [ ] Each sub-gate has defined inputs, pass condition, and evidence output
- [ ] Gate evaluation order is deterministic (numeric order)
- [ ] Failure in any sub-gate causes G7_VERIFICATION to fail
- [ ] Evidence blocks include actionable remediation guidance
- [ ] Gate spec JSON matches gate definitions
