# FEAT-001 — Control Plane Core: Gates & Proofs

## 1. Gate-to-Stage Mapping

The Control Plane enforces 8 gates across the 10-stage pipeline. Gates are defined in `STAGE_GATES` (types/run.ts) and loaded into each run at creation time.

| Stage | Gate | Description |
|-------|------|-------------|
| S2_VALIDATE_INTAKE | G1_INTAKE_VALIDITY | Validates intake submission against schema |
| S4_VALIDATE_CANONICAL | G2_CANONICAL_INTEGRITY | Validates canonical spec referential integrity |
| S5_RESOLVE_STANDARDS | G3_STANDARDS_RESOLVED | Validates standards snapshot completeness |
| S6_SELECT_TEMPLATES | G4_TEMPLATE_SELECTION | Validates template selection correctness |
| S7_RENDER_DOCS | G5_TEMPLATE_COMPLETENESS | Validates filled template completeness |
| S8_BUILD_PLAN | G6_PLAN_COVERAGE | Validates work breakdown coverage |
| S9_VERIFY_PROOF | G7_VERIFICATION | Validates proof and evidence completeness |
| S10_PACKAGE | G8_PACKAGE_INTEGRITY | Validates kit package contract |

Stages S1_INGEST_NORMALIZE and S3_BUILD_CANONICAL have no associated gates.

## 2. Gate Enforcement Behavior

When `recordStageResult()` is called with `result: "fail"`:

1. If the failed stage has an associated gate in `stage_gates`:
   - Run transitions to `gated` (not `failed`)
   - An error entry is appended to `run.errors[]` with message: `Gate ${gateId} blocked stage ${stageId}`
   - The run can be retried by calling `advanceStage()` again (gated → running)

2. If the failed stage has no associated gate:
   - Run transitions to `failed`
   - The run cannot be retried (failed → archived only)

## 3. Required Gates

All 8 gates are required for every run (from `GATES_REQUIRED`):

- G1_INTAKE_VALIDITY
- G2_CANONICAL_INTEGRITY
- G3_STANDARDS_RESOLVED
- G4_TEMPLATE_SELECTION
- G5_TEMPLATE_COMPLETENESS
- G6_PLAN_COVERAGE
- G7_VERIFICATION
- G8_PACKAGE_INTEGRITY

## 4. Run Completion Gate

`completeRun()` enforces a meta-gate: all stages must have status `pass` or `skip`. If any stage is in another status, the run cannot be completed (throws with list of incomplete stages).

## 5. Gate Reports

Gate report references are stored in `run.gate_reports: GateReportRef[]`. Each reference contains:

```typescript
interface GateReportRef {
  gate_id: string;
  report_ref: string;
  status: "pass" | "fail";
  timestamp: string;
}
```

## 6. Required Proof Types

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | Verifying run creation, stage advancement |
| P-02 | Test Result Proof | Unit and integration test results |
| P-05 | Diff/Commit Reference Proof | Code change verification |
| P-06 | Checklist Proof | Manual review of state transitions |

## 7. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
