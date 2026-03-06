---
library: verification
id: VER-6c
schema_version: 1.0.0
status: draft
---

# VER-6c — Determinism Rules (Verification Gates)

- Gate evaluation order is fixed: VER-GATE-01 through VER-GATE-07 in numeric order.
- Each gate reads only pinned artifacts and registries.
- Gate results are deterministic given the same inputs.
- Evidence blocks are generated for every gate (pass or fail).
- G7_VERIFICATION result is the logical AND of all sub-gate results.
