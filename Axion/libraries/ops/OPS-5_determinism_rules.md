---
library: ops
id: OPS-5
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# OPS-5 — Determinism Rules (Cost Models & Quota Hooks)

## Invariants

1. **Model immutability within a run**: Once a run begins, the cost model and quota
   thresholds are frozen. Changes only apply to future runs.

2. **Version pinning**: The cost model is versioned. The run manifest records which
   version of `COST-01` was active during the run.

3. **Stable identity**: A `model_id` always refers to the same cost model variant.
   If assumptions change, a new version is created.

4. **Unit consistency**: The unit definitions (`cpu_seconds`, `megabytes`) are fixed
   within a model version. Unit conversions are not performed implicitly.

5. **Quota hook determinism**: Quota hooks reference the same thresholds and breach
   actions for every run using the same model version. The hooks do not adapt
   dynamically based on historical cost data.

## What is NOT deterministic (by design)
- **Actual resource consumption** depends on workload complexity and system conditions.
- Whether a **quota hook triggers** depends on actual vs estimated consumption.
- **Daily aggregates** depend on the number and characteristics of runs in a day.

## Verification
- Cost model content can be hashed and compared across runs.
- Quota hook evaluations can be replayed given the same resource consumption measurements.
