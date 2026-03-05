# FEAT-002 — Operator UI Core: Error Codes

## 1. Error Code Format

Errors in the CLI layer are thrown as native `Error` objects with descriptive messages. Stub commands throw `NotImplementedError` (from `src/utils/errors.ts`).

## 2. Domain

`CLI`

## 3. Runtime Errors

| Error | Source | Trigger | Exit Code |
|-------|--------|---------|-----------|
| `"Usage: axion run stage <run_id> <stage_id>"` | `axion.ts` | Missing positional args for `run stage` | 1 |
| `"Usage: axion run gates <run_id> <stage_id>"` | `axion.ts` | Missing positional args for `run gates` | 1 |
| `"Invalid stage_id: {arg}"` | `runStage.ts` | Stage ID not in `STAGE_ORDER` | 1 |
| `"Run not found: {runId}"` | `runStage.ts` | Run manifest JSON does not exist at expected path | 1 |
| `"Stage {stageId} not found in manifest for run {runId}"` | `runStage.ts` | Stage entry missing from run manifest's `stages[]` array | 1 |
| `"Cannot run S2: normalized_input.json not found. Run S1 first."` | `runStage.ts` | S2 executed without prior S1 | thrown |
| `"Cannot run S3: normalized_input.json not found. Run S1 first."` | `runStage.ts` | S3 executed without prior S1 | thrown |
| `"Cannot run S4: canonical_spec.json not found. Run S3 first."` | `runStage.ts` | S4 executed without prior S3 | thrown |
| `"Cannot run S5: normalized_input.json not found. Run S1 first."` | `runStage.ts` | S5 executed without prior S1 | thrown |
| `"Cannot run S8: canonical_spec.json not found. Run S3 first."` | `runStage.ts` | S8 executed without prior S3 | thrown |
| `"Pipeline halted: stage {stageId} failed"` | `runControlPlane.ts` | Gate failure during full run | 1 |
| `"Fatal error: {message}"` | `axion.ts` | Unhandled exception in `main()` | 1 |
| `NotImplementedError("{cmdName}")` | Stub command modules | Invoking an unimplemented standalone command | thrown |

## 4. Stub Commands (NotImplementedError)

The following standalone command modules exist but throw `NotImplementedError` when invoked directly. Their functionality is already implemented inline within `executeStageWork()` in `runStage.ts` as part of the pipeline flow:

| Module | Function | Stub Reason |
|--------|----------|-------------|
| `validateIntake.ts` | `cmdValidateIntake` | Validation runs inline in S1/S2 stages |
| `resolveStandards.ts` | `cmdResolveStandards` | Resolution runs inline in S5 stage |
| `buildSpec.ts` | `cmdBuildSpec` | Spec building runs inline in S3 stage |
| `fillTemplates.ts` | `cmdFillTemplates` | Template filling runs inline in S7 stage |
| `generateKit.ts` | `cmdGenerateKit` | Kit generation runs inline in S10 stage |
| `exportBundle.ts` | `cmdExportBundle` | Planned for FEAT-009 standalone export |
| `release.ts` | `cmdRelease` | Planned for FEAT-010 release signing |
| `repro.ts` | `cmdRepro` | Planned for FEAT-016 repro export |

## 5. Error Handling Rules

- All `process.exit(1)` calls are preceded by a descriptive error message to stderr
- Stage prerequisite errors include the name of the missing file and which prior stage must run
- The top-level `main().catch()` handler ensures no unhandled promise rejections escape
- Gate failure errors include the gate ID and stage ID in the message

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-017 (Error Taxonomy & Registry)
