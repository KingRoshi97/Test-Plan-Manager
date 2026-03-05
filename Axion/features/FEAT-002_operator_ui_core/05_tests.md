# FEAT-002 — Operator UI Core: Test Plan

## 1. Unit Tests

### 1.1 `cmdInit` (initAxion.ts)

- Creates `.axion/runs/` directory when it does not exist
- Creates `run_counter.json` with `{ "next": 1 }` when it does not exist
- Is idempotent — does not overwrite existing `run_counter.json`
- Prints initialization message to stdout

### 1.2 `cmdRunStart` (runControlPlane.ts)

- Allocates a new `RUN-NNNNNN` ID via `RunController.createRun()`
- Writes `run_manifest.json` to the run directory
- Writes initial `artifact_index.json` with manifest and index entries
- Returns the run ID string

### 1.3 `cmdRunFull` (runControlPlane.ts)

- Calls `cmdInit` before creating a run
- Iterates all 10 stages in `STAGE_ORDER` sequence
- Calls `controller.advanceStage()` before each stage
- Calls `controller.recordStageResult()` after each stage
- Halts with `process.exit(1)` on first gate failure
- Calls `controller.completeRun()` after all stages pass
- Prints artifact listing from the run directory

### 1.4 `executeStageWork` (runStage.ts)

- S1: Creates default raw submission if none exists, normalizes, validates, writes submission record
- S2: Validates intake, writes validation report; throws if `normalized_input.json` missing
- S3: Builds canonical spec, extracts/merges unknowns; throws if `normalized_input.json` missing
- S4: Validates canonical spec; throws if `canonical_spec.json` missing
- S5: Loads standards registry, evaluates applicability, resolves standards, writes snapshot
- S6: Selects templates based on canonical spec and standards snapshot
- S7: Renders documents from selected templates
- S8: Builds work breakdown, acceptance map, coverage report, state snapshot
- S9: Collects gate reports, runs verification, creates proof objects, validates pointers, writes completion report
- S10: Packages kit via `buildRealKit`

### 1.5 `executeStageWithGates` (runStage.ts)

- Runs stage work then gate; returns `{ passed: true }` if no gate or gate passes
- Returns `{ passed: false }` if gate fails; writes fail StageReport
- Appends stage report entry to `artifact_index.json` with SHA-256 hash

### 1.6 `cmdRunStage` (runStage.ts)

- Rejects invalid stage IDs with error message listing valid stages
- Rejects nonexistent run IDs
- Updates manifest stage status and `updated_at` timestamp
- Sets `manifest.status = "completed"` when all stages pass
- Sets `manifest.status = "failed"` on gate failure

### 1.7 `cmdRunGates` (runGates.ts)

- Prints per-gate pass/fail status
- Prints failure codes for failed gates
- Exits with code 1 if any gate fails
- Silently returns if no gate reports are generated

### 1.8 Helper Commands

- `cmdPlanWork(runId, runDir)` — writes sequencing report to `planning/`
- `cmdPackageKit(runId, runDir)` — writes kit manifest, entrypoint, version stamp to `kit/`
- `cmdVerify(runId, runDir)` — writes placeholder completion report to `verification/`
- `cmdWriteState(runId, runDir)` — writes state snapshot, resume plan, creates handoff directory
- `cmdWriteProof(runId, runDir)` — appends placeholder proof entry to proof ledger

## 2. Integration Tests

- Full pipeline run (`axion run`) completes all 10 stages and 8 gates for default submission
- Single stage execution (`axion run stage`) produces correct artifacts and updates manifest
- Gate-only execution (`axion run gates`) evaluates and reports gate results
- Pipeline halts correctly on injected gate failure

## 3. Acceptance Tests

- All implemented CLI commands produce correct console output
- Exit codes are 0 for success, 1 for all failure paths
- Run directory contains all expected artifacts after full run
- Artifact index contains SHA-256 hashes for all stage reports

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/intake_submissions/`
- Helpers: `test/helpers/`

## 5. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
