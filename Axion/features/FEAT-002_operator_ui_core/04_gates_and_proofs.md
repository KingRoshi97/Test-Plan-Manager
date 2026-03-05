# FEAT-002 — Operator UI Core: Gates & Proofs

## 1. Applicable Gates

FEAT-002 does not own any gates. The CLI invokes gates owned by FEAT-003 (Gate Engine Core) during stage execution. The gate mapping used by the CLI is defined in `STAGE_GATES` from `src/types/run.ts`:

| Stage | Gate |
|-------|------|
| S2_VALIDATE_INTAKE | G1_INTAKE_VALIDITY |
| S4_VALIDATE_CANONICAL | G2_CANONICAL_INTEGRITY |
| S5_RESOLVE_STANDARDS | G3_STANDARDS_RESOLVED |
| S6_SELECT_TEMPLATES | G4_TEMPLATE_SELECTION |
| S7_RENDER_DOCS | G5_TEMPLATE_COMPLETENESS |
| S8_BUILD_PLAN | G6_PLAN_COVERAGE |
| S9_VERIFY_PROOF | G7_VERIFICATION |
| S10_PACKAGE | G8_PACKAGE_INTEGRITY |

Stages S1_INGEST_NORMALIZE and S3_BUILD_CANONICAL have no gate and pass unconditionally.

## 2. Gate Invocation Flow

1. `executeStageWithGates()` runs the stage work via `executeStageWork()`
2. Looks up `STAGE_GATES[stageId]` for the mapped gate ID
3. If a gate exists, calls `runGatesForStage(baseDir, runId, stageId)` from FEAT-003
4. If `gateResult.all_passed` is false, produces a fail `StageReport` and returns `{ passed: false }`
5. If no gate is mapped or gate passes, produces a pass `StageReport`

## 3. Proof Generation

The CLI generates proof artifacts during S9_VERIFY_PROOF:

- Calls `collectGateReports(runDir)` to gather all `*.gate_report.json` files
- Calls `createProofsFromGateReports(gateReports, runId)` to create proof objects
- Appends each proof object to the `ProofLedger` at `proof/proof_ledger.jsonl`
- Validates evidence pointers via `validatePointers()`
- Writes completion report via `writeCompletionReport()`

## 4. Required Proof Types

| Proof Type | Name | Usage in CLI |
|------------|------|-------------|
| P-01 | Command Output Proof | Gate report artifacts produced by `runGatesForStage` |
| P-02 | Test Result Proof | Verification run result from `runVerification` |

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
