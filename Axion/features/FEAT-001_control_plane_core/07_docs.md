# FEAT-001 — Control Plane Core: Documentation Requirements

## 1. Module Documentation

### api.ts — RunController

- Class: `RunController(store: RunStore, audit?: AuditLogger, baseDir?: string)`
- Methods: `createRun`, `advanceStage`, `recordStageResult`, `completeRun`, `getRunStatus`
- Private: `transitionRun` — enforces valid state transitions

### model.ts — Type Definitions

- Types: `ICPRunStatus`, `ICPStageStatus`, `ICPStageRun`, `ICPRun`, `ProofRef`
- Mapping constants: `ICP_TO_MANIFEST_RUN_STATUS`, `ICP_TO_MANIFEST_STAGE_STATUS`
- Conversion functions: `icpRunToManifest`, `manifestToICPRun`
- Re-exports: `RunManifest`, `StageId`, `StageStatus`, `GateReportRef`, `RunError`, `ArtifactRef`

### store.ts — Persistence

- Interface: `RunStore` — `createRun`, `getRun`, `updateRun`, `listRuns`
- Implementation: `JSONRunStore` — file-based JSON persistence

### audit.ts — Audit Logging

- Class: `AuditLogger(logPath: string)`
- Method: `append(action, runId, details)` — writes hash-chained JSONL

### pins.ts — Artifact Pinning

- Functions: `pinArtifact`, `unpinArtifact`, `listPins`, `verifyPin`, `verifyAllPins`
- Types: `PinEntry`, `Pinset`

### releases.ts — Release Lifecycle

- Functions: `createRelease`, `signRelease`, `publishRelease`, `revokeRelease`, `getRelease`, `listReleases`
- Types: `Release`, `ReleaseStatus`

### policies.ts — Policy Engine

- Functions: `loadPolicies`, `evaluatePolicy`, `evaluateAllPolicies`
- Types: `Policy`, `PolicyRule`, `PolicyEvaluationResult`, `RiskClass`, `OverrideRule`, `PolicyContext`

## 2. Architecture Documentation

- 7 modules in `src/core/controlPlane/`
- `api.ts` depends on `model.ts`, `store.ts`, `audit.ts`
- `pins.ts` and `releases.ts` are independent modules with their own filesystem persistence
- `policies.ts` is independent — loads policies from JSON files, evaluates against context
- All modules depend on shared utilities (`utils/fs.js`, `utils/time.js`, `utils/hash.js`)
- All modules depend on shared types (`types/run.js`, `types/artifacts.js`)

## 3. System Documentation References

| Document | Relevance |
|----------|-----------|
| SYS-03 | End-to-End Architecture — pipeline and stage definitions |
| SYS-07 | Compliance & Gate Model — gate enforcement rules |
| STATE-01 | State Snapshot Format — run manifest structure |
| STATE-02 | Resume Rules — gated run retry behavior |
| GOV-04 | Audit & Traceability Rules — audit log requirements |
| ORD-01 | Build Order Graph — stage sequencing |
| ORD-02 | Gate DSL & Gate Rules — gate definitions |

## 4. Change Log

- All changes to control plane modules must be recorded
- Breaking changes to `RunStore` interface require migration
- Breaking changes to `ICPRun` schema require manifest migration

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
- GOV-03 (Deprecation & Migration Rules)
