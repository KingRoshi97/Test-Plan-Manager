---
library: ops
id: OPS-3
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# OPS-3 — Determinism Rules (SLO/SLA & Error Budgets)

## Invariants

1. **SLO immutability within a window**: Once an SLO measurement window opens, the
   objective and measurement formula are frozen for that window. Changes apply to the
   next window.

2. **Version pinning**: The SLO policy is versioned. The run manifest records which
   version of `SLO-01` was active during the run.

3. **Stable identity**: An `slo_id` always refers to the same logical objective. If
   the objective changes, a new version is created — the ID is not reused.

4. **Measurement determinism**: SLO measurements reference stable run metrics
   (success counts, latency percentiles). No measurement may reference values
   external to the pipeline's own telemetry.

5. **Burn alert thresholds are static**: The threshold and window for each burn alert
   are fixed per policy version. They do not adapt dynamically within a window.

6. **Enforcement action determinism**: Each burn alert maps to exactly one enforcement
   action. The mapping is declared in the policy and does not change at runtime.

## What is NOT deterministic (by design)
- The **current budget consumption** depends on actual run outcomes over the window.
- Whether a **burn alert fires** depends on the rate of failures.
- The **effective gate severity** may change if a tighten_gates action is triggered.

## Verification
- SLO policy content can be hashed and compared across windows.
- Burn alert firings can be replayed given the same run outcome sequence.
