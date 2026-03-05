---
library: orchestration
id: ORC-6
schema_version: 1.0.0
status: draft
---

# ORC-6 — Orchestration Gates (Stage Contract Compliance)

## Purpose
Ensure stages cannot drift from the declared pipeline + IO contracts.

## Gate set (minimum)

### ORC-GATE-01 — Stage order integrity
- Stage execution must follow pipeline.stage_order.
- Skips must be justified by activation rules and recorded.

### ORC-GATE-02 — Consumes exist and validate
- Before a stage executes, all consumes contract artifacts must exist and validate against
schema_ref.

### ORC-GATE-03 — Produces complete
- On stage success, all produces contract artifacts must exist and validate.

### ORC-GATE-04 — Stage report emitted
- Every executed stage must emit exactly one stage_report.v1 with correct input/output refs.

### ORC-GATE-05 — Run manifest coherence
- Run manifest must include:
  - pipeline_ref
  - pins.pin_set_ref
  - stage timeline entries aligned with emitted reports
  - artifact entries aligned with stage outputs

### ORC-GATE-06 — Rerun/resume invariants
- Resume and rerun actions must comply with ORC-5 invariants and be recorded as events.
