# FEAT-001 — Control Plane Core: Error Codes

## 1. Error Code Format

Errors are thrown as standard `Error` objects with descriptive messages. The error messages follow consistent patterns per module.

## 2. Errors by Module

### api.ts — RunController

| Throw Condition | Message Pattern | Trigger |
|----------------|-----------------|---------|
| Run not found | `Run ${runId} not found` | `advanceStage`, `recordStageResult`, `completeRun` when store returns null |
| Stage not in order | `Stage ${stageId} not in run stage_order` | `advanceStage` when stageId not in `run.stage_order` |
| Prior stage incomplete | `Cannot advance to ${stageId}: prior stage ${prevStageId} is ${status} (must be pass or skip)` | `advanceStage` when previous stage is not pass/skip |
| Run status blocks advance | `Cannot advance stage: run is ${status}` | `advanceStage` when run is not queued, running, or gated |
| Stage not found in run | `Stage ${stageId} not found in run ${runId}` | `advanceStage`, `recordStageResult` when stage lookup fails |
| Run not complete | `Cannot complete run: stages not done: ${list}` | `completeRun` when not all stages are pass/skip |
| Invalid transition | `Invalid run transition: ${current} → ${target}` | `transitionRun` when target not in allowed transitions |

### store.ts — JSONRunStore

| Throw Condition | Message Pattern | Trigger |
|----------------|-----------------|---------|
| Run not found on update | `Run ${runId} not found` | `updateRun` when existing run not found |

### pins.ts

| Throw Condition | Message Pattern | Trigger |
|----------------|-----------------|---------|
| File not found | `Cannot pin artifact: file not found at ${path}` | `pinArtifact` when file does not exist |
| Duplicate pin | `Artifact already pinned: ${path} (pin_id: ${id})` | `pinArtifact` when artifact already has a pin |
| Pin not found | `Pin not found: ${pinId} in run ${runId}` | `unpinArtifact`, `verifyPin` when pin ID not in pinset |

### releases.ts

| Throw Condition | Message Pattern | Trigger |
|----------------|-----------------|---------|
| Release not found | `Release ${releaseId} not found` | `signRelease`, `publishRelease`, `revokeRelease` |
| Invalid transition | `Invalid release transition: ${current} → ${target}. Allowed: ${list}` | Any status change violating transition rules |
| Unsigned publish | `Release ${releaseId} must be signed before publishing` | `publishRelease` when `signatures.length === 0` |

## 3. Error Handling Rules

- All errors are synchronous `throw new Error(message)` — no custom error classes
- Error messages include context (run ID, stage ID, pin ID, release ID) for debuggability
- No error codes from a formal registry are used — errors are identified by message pattern
- Gate-blocked stage failures result in run status `gated` (not `failed`), logged in `run.errors[]`

## 4. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
