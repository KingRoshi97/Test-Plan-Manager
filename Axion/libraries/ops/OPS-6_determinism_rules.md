---
library: ops
id: OPS-6b
schema_version: 1.0.0
status: draft
---

# OPS-6b — Determinism Rules (Ops Gates)

- Gate evaluation order is fixed: OPS-GATE-01 through OPS-GATE-06 in numeric order.
- Each gate reads only pinned artifacts and registries.
- Gate results are deterministic given the same inputs.
- Evidence blocks are generated for every gate (pass or fail).
- Ops gate aggregate result is the logical AND of all sub-gate results.
- No external service calls during gate evaluation; all checks use local artifacts.
- Threshold comparisons use exact numeric equality or inequality — no floating-point tolerance unless explicitly configured.
