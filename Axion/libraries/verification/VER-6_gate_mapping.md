---
library: verification
id: VER-6a
schema_version: 1.0.0
status: draft
---

# VER-6a — Gate Mapping

## Mapping: VER-GATE → G7_VERIFICATION

G7_VERIFICATION passes when ALL of the following sub-gates pass:

| VER Gate | Maps To | Inputs | Pass Condition |
|----------|---------|--------|----------------|
| VER-GATE-01 | G7_VERIFICATION | proof_types registry, proof_types schema | Registry validates against schema; all proof_type values are from closed enum |
| VER-GATE-02 | G7_VERIFICATION | proof_ledger, proof_ledger schema, proof_types registry | Ledger validates; all proof_type refs exist in registry; evidence_refs present |
| VER-GATE-03 | G7_VERIFICATION | command_run_log, command_run schema | Log validates; all non-skipped runs have logs_ref; deterministic ordering |
| VER-GATE-04 | G7_VERIFICATION | completion_criteria, proof_ledger, gate_reports | unit_done and run_done requirements all satisfied |
| VER-GATE-05 | G7_VERIFICATION | command_run_log, verification_command_policy | No command runs matched a deny rule; require_approval decisions recorded |
| VER-GATE-06 | G7_VERIFICATION | proof_ledger, acceptance_map | All required proofs have non-empty evidence_refs with valid paths |
| VER-GATE-07 | G7_VERIFICATION | all verification artifacts | All artifacts deterministically ordered; registries pinned; no mutations |

## Failure behavior
- Each sub-gate produces its own evidence block with:
  - what failed
  - which artifacts were checked
  - remediation steps
- G7_VERIFICATION aggregates all sub-gate results
