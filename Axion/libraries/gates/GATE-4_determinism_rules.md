---
library: gates
id: GATE-4
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# GATE-4 — Determinism Rules (Gate Reports)

## Invariants

1. **Immutable after creation**: A gate report is never modified after it is written,
   except for the addition of an override section.

2. **Deterministic content**: Given the same evaluation inputs, the report contains the
   same `status`, `checks`, `failure_codes`, and `evidence`. Only `evaluated_at` and
   `engine` metadata may differ.

3. **Stable path**: The report is always written to
   `{run_dir}/gates/{gate_id}.gate_report.json`. This path is deterministic given the
   run_id and gate_id.

4. **Append-only manifest reference**: The run manifest's `gate_reports` array is
   append-only. A gate report reference is added once and never removed.

5. **Override audit trail**: If an override is applied, the original status is preserved
   in `override.original_status`. The top-level `status` changes to reflect the override,
   but the original verdict is never lost.

## Report Identity
A gate report is uniquely identified by the combination of `run_id` + `gate_id`. There
is exactly one report per gate per run (replays create new runs, not new reports in the
same run).

## Replay Implications
When replaying a run (GATE-5), new gate reports are created in the replay run. The
original run's reports are never modified. Comparison between original and replay
reports is done by matching `gate_id` and comparing `status` and `checks`.
