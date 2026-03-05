# FEAT-002 — Operator UI Core: API Surface

## 1. CLI Entry Point

### `main()` — `src/cli/axion.ts`

- **Signature**: `async function main(): Promise<void>`
- **Behavior**: Parses `process.argv`, resolves `baseDir`, dispatches to command handler via switch
- **Commands**: `init`, `run`, `run start`, `run stage`, `run gates`, `help`
- **Error handling**: Top-level `.catch()` prints fatal error and exits with code 1

### `resolveBaseDir()` — `src/cli/axion.ts`

- **Signature**: `function resolveBaseDir(): string`
- **Returns**: `"."` if `registries/` exists in CWD, `"Axion"` if `Axion/registries/` exists, else `"."`

## 2. Public Command Functions (Implemented)

### `cmdInit(baseDir: string): void` — `initAxion.ts`

- Creates `.axion/runs/` directory
- Creates `run_counter.json` with `{ "next": 1 }` if it does not exist
- Idempotent

### `createRunController(baseDir: string): RunController` — `runControlPlane.ts`

- Factory function — creates `JSONRunStore`, `AuditLogger`, returns `RunController`
- Store path: `{baseDir}/.axion/`
- Audit log path: `{baseDir}/.axion/audit.jsonl`

### `cmdRunStart(baseDir: string): Promise<string>` — `runControlPlane.ts`

- Creates a new run via `controller.createRun({})`
- Writes `run_manifest.json` and initial `artifact_index.json`
- Returns the allocated run ID (e.g., `"RUN-000001"`)

### `cmdRunFull(baseDir: string): Promise<void>` — `runControlPlane.ts`

- Calls `cmdInit`, creates run, iterates `STAGE_ORDER` (S1–S10)
- For each stage: `advanceStage()` → `executeStageWithGates()` → `recordStageResult()`
- Halts on first gate failure; calls `completeRun()` on success
- Prints artifact listing at end

### `executeStageWork(baseDir, runDir, runId, stageId, generatedAt): void` — `runStage.ts`

- Dispatches to stage-specific logic based on `stageId` (S1–S10)
- Reads/writes artifacts in `runDir` subdirectories (intake/, canonical/, standards/, templates/, planning/, verification/, proof/, kit/)

### `executeStageWithGates(baseDir, runDir, runId, stageId, generatedAt): StageExecutionResult` — `runStage.ts`

- **Returns**: `{ passed: boolean; reportRelPath: string }`
- Runs stage work, then runs mapped gate (if any)
- Writes `StageReport` to `stage_reports/{stageId}.json`
- Appends to `artifact_index.json`

### `cmdRunStage(baseDir, runId, stageIdArg): void` — `runStage.ts`

- Validates stage ID via `resolveStageId()`
- Loads run manifest, executes stage with gates, updates manifest
- Exits with code 1 on invalid args or gate failure

### `cmdRunGates(baseDir, runId, stageId): void` — `runGates.ts`

- Calls `runGatesForStage()` from FEAT-003
- Prints per-gate results; exits with code 1 if any fail

### `cmdPlanWork(runId, runDir): void` — `planWork.ts`

- Writes `sequencing_report.json` to `planning/`

### `cmdPackageKit(runId, runDir): void` — `packageKit.ts`

- Writes `kit_manifest.json`, `entrypoint.json`, `version_stamp.json` to `kit/`

### `cmdVerify(runId, runDir): void` — `verify.ts`

- Writes placeholder `completion_report.json` to `verification/`

### `cmdWriteState(runId, runDir): void` — `writeState.ts`

- Writes `state_snapshot.json`, `resume_plan.json` to `state/`
- Creates `handoff_packet/` directory

### `cmdWriteProof(runId, runDir): void` — `writeProof.ts`

- Appends a placeholder proof entry to `proof/proof_ledger.jsonl`

## 3. Standalone Stage Command Functions

### `cmdValidateIntake(inputPath: string, schemaVersion?: string): void` — `validateIntake.ts`

- Reads a normalized input JSON file and validates it against the intake schema
- Prints JSON validation report to stdout; exits with code 1 if invalid
- Defaults to schema version `"1.0.0"` if not specified

### `cmdResolveStandards(runDir: string, libraryPath?: string): void` — `resolveStandards.ts`

- Reads `intake/normalized_input.json` from the run directory
- Loads standards registry, evaluates applicability, resolves standards
- Writes `applicability_output.json`, `resolved_standards_snapshot.json`, `resolver_output.json` to `standards/`

### `cmdBuildSpec(runDir: string): void` — `buildSpec.ts`

- Reads `intake/normalized_input.json`, builds canonical spec, extracts unknowns
- Writes `canonical_spec.json` and `unknowns.json` to `canonical/`

### `cmdFillTemplates(runDir: string, templateLibraryPath?: string): void` — `fillTemplates.ts`

- Reads canonical spec and standards snapshot from run directory
- Runs template selection and rendering via `writeSelectionResult()` + `writeRenderedDocs()`
- Writes selection results and rendered documents to `templates/`

### `cmdGenerateKit(inputPath: string, outputDir?: string): void` — `generateKit.ts`

- Packages a completed run directory into a deliverable kit
- Delegates to `buildRealKit()` from FEAT-009

### `cmdExportBundle(runDir: string, profile?: BundleProfile, outputPath?: string): void` — `exportBundle.ts`

- Exports a filtered subset of run artifacts based on the selected profile
- Profiles: `thin` (canonical + templates), `full` (all directories), `audit` (gates + verification + proof), `public` (canonical + templates + kit), `internal` (no gates/verification), `repro` (intake through gates)
- Writes `bundle_manifest.json` with content hash

### `cmdRelease(runDir: string, version: string): void` — `release.ts`

- Creates a release object from a completed pipeline run
- Collects artifacts from `artifact_index.json`, computes integrity hash
- Supports `sign`, `publish`, `revoke`, `get`, `list` subcommands

### `cmdRepro(runDir: string, outputPath?: string): void` — `repro.ts`

- Exports a minimal reproducible package from a run
- Selects core artifacts, computes content hashes, writes `repro_manifest.json`

`BundleProfile` type: `"thin" | "full" | "audit" | "public" | "internal" | "repro"`

## 4. Re-exported API — `src/cli/index.ts`

```typescript
export { cmdInit } from "./commands/initAxion.js";
export { cmdRunStart } from "./commands/runControlPlane.js";
export { cmdRunStage } from "./commands/runStage.js";
export { cmdRunGates } from "./commands/runGates.js";
export { cmdPlanWork } from "./commands/planWork.js";
export { cmdPackageKit } from "./commands/packageKit.js";
export { cmdVerify } from "./commands/verify.js";
export { cmdWriteState } from "./commands/writeState.js";
export { cmdWriteProof } from "./commands/writeProof.js";
```

## 5. Key Types

### `StageExecutionResult` — `runStage.ts`

```typescript
interface StageExecutionResult {
  passed: boolean;
  reportRelPath: string;
}
```

### `STAGE_IO` — `runStage.ts`

```typescript
Record<string, { consumed: string[]; produced: string[] }>
```

Declares input/output artifact paths for each of the 10 stages.

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
- `src/types/run.ts` (STAGE_ORDER, STAGE_GATES, StageId, StageReport, RunManifest)
- `src/types/artifacts.ts` (ArtifactIndexEntry)
