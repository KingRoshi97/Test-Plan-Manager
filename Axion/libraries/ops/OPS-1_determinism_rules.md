---
library: ops
id: OPS-1
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# OPS-1 — Determinism Rules (Monitoring & Alerts)

## Invariants

1. **Rule immutability within a run**: Once a run begins, the alert rule set used for that
   run is frozen. Changes to alert rules only apply to future runs.

2. **Version pinning**: The alert rules registry is versioned. The run manifest records
   which version of `ALRT-01` was active during the run.

3. **Stable identity**: A `rule_id` always refers to the same logical alert. If the
   alert semantics change, a new version is created — the ID is not reused.

4. **Condition determinism**: Alert conditions reference stable metric counters and
   timing fields. No condition may reference non-deterministic values (wall-clock time
   external to the run, random values, external API responses).

5. **Registry completeness**: All rule_ids referenced by the pipeline must exist in the
   active alert rules registry. Missing rule definitions are a configuration error.

## What is NOT deterministic (by design)
- The **result** of evaluating a condition depends on live run metrics, which differ per run.
- Whether an alert is **acknowledged** depends on operator action at runtime.
- The **timestamp** of alert firing reflects evaluation time, not definition time.

## Verification
- Alert rule content can be hashed and compared across runs.
- A replay run must use the same alert registry version as the original run.
