---
library: ops
id: OPS-4
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# OPS-4 — Determinism Rules (Performance Budgets & Profiling)

## Invariants

1. **Budget immutability within a run**: Once a run begins, the stage budgets and run
   budget are frozen. Changes to budgets only apply to future runs.

2. **Version pinning**: The performance budget configuration is versioned. The run
   manifest records which version of `PERF-01` was active during the run.

3. **Stage identity**: Stage IDs in the budget map must correspond 1:1 with stages
   in the pipeline definition. A budget for a non-existent stage is a configuration error.

4. **Threshold stability**: The `capture_threshold_ms` is fixed per configuration
   version. It does not adapt dynamically based on observed performance.

5. **Profile output determinism**: The `profile_output_path` template uses only the
   `run_id` variable. Profile file names are deterministic given the run identity.

## What is NOT deterministic (by design)
- **Actual stage timings** depend on workload, system load, and input complexity.
- Whether a **profile is captured** depends on whether the threshold is exceeded.
- The **content** of profile artifacts varies per run.

## Verification
- Budget configuration can be hashed and compared across runs.
- A replay run must use the same budget version as the original run.
- Profile capture decisions can be replayed given the same stage timings.
