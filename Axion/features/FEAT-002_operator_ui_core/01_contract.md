# FEAT-002 — Operator UI Core: Contract

## 1. Purpose

CLI entry point (`axion.ts`) and command modules that expose the Axion pipeline to operators. The CLI routes user commands to the underlying control plane (FEAT-001), gate engine (FEAT-003), and kit builder (FEAT-009). It is the sole human-facing interface for triggering runs, executing individual stages, running gates, packaging kits, writing state/proof artifacts, and inspecting pipeline output.

## 2. Inputs

| Input | Source | Format |
|-------|--------|--------|
| `process.argv` | Shell invocation | Positional arguments: `axion <command> [subcommand] [args...]` |
| `baseDir` | Auto-resolved | String path — resolves to `"."` if `registries/` exists locally, else `"Axion"` |
| Run directory | Filesystem | `.axion/runs/RUN-NNNNNN/` — contains all stage artifacts |
| `run_counter.json` | `.axion/run_counter.json` | `{ "next": number }` |

## 3. Outputs

| Output | Destination | Format |
|--------|-------------|--------|
| Console messages | stdout/stderr | Human-readable status lines prefixed with stage/command context |
| `.axion/` directory | Filesystem | Created by `cmdInit` — contains `runs/` and `run_counter.json` |
| Run artifacts | `.axion/runs/RUN-NNNNNN/` | JSON files: manifests, stage reports, gate reports, canonical spec, kit bundle |
| Artifact listing | stdout | Tree of all files in the completed run directory (printed by `axion run`) |
| Exit codes | Process | `0` = success, `1` = error (invalid args, stage failure, gate failure) |

## 4. CLI Commands

| Command | Function | Module |
|---------|----------|--------|
| `axion init` | `cmdInit(baseDir)` | `initAxion.ts` |
| `axion run` | `cmdRunFull(baseDir)` | `runControlPlane.ts` |
| `axion run start` | `cmdRunStart(baseDir)` | `runControlPlane.ts` |
| `axion run stage <run_id> <stage_id>` | `cmdRunStage(baseDir, runId, stageId)` | `runStage.ts` |
| `axion run gates <run_id> <stage_id>` | `cmdRunGates(baseDir, runId, stageId)` | `runGates.ts` |
| `axion help` | Prints `USAGE` string | `axion.ts` |

## 5. Invariants

- `cmdInit` is idempotent — calling it multiple times does not reset the run counter
- `cmdRunFull` calls `cmdInit` before starting, ensuring `.axion/` always exists
- `cmdRunFull` iterates `STAGE_ORDER` (S1–S10) sequentially; if any stage's gate fails, the pipeline halts with `process.exit(1)`
- `cmdRunStage` validates the `stageId` argument against `STAGE_ORDER` and rejects unknown stages
- `cmdRunStage` updates the run manifest's stage status to `"pass"` or `"fail"` and sets `manifest.status = "failed"` on gate failure
- Every stage execution produces a `StageReport` JSON written to `stage_reports/{stageId}.json`
- Each stage report entry is appended to `artifact_index.json` with its SHA-256 hash
- `executeStageWithGates` runs stage work first, then runs the mapped gate (from `STAGE_GATES`); if no gate is mapped, the stage passes unconditionally
- `cmdRunGates` prints per-gate pass/fail status and exits with code 1 if any gate fails
- Base directory resolution: checks for `registries/` in CWD first, falls back to `Axion/`

## 6. Dependencies

- FEAT-001 (Control Plane Core) — `RunController`, `JSONRunStore`, `AuditLogger`, `icpRunToManifest`
- FEAT-003 (Gate Engine Core) — `runGatesForStage`
- FEAT-009 (Export Bundles) — `buildRealKit`
- Core modules: intake normalizer/validator, canonical spec builder, standards resolver, template selector/renderer, planning (work breakdown, acceptance map, coverage), verification runner, proof ledger, state snapshot

## 7. Failure Modes

| Failure | Trigger | Behavior |
|---------|---------|----------|
| Invalid stage ID | `cmdRunStage` with unknown stage | Prints valid stages to stderr, `process.exit(1)` |
| Missing run | `cmdRunStage` with nonexistent run ID | Prints "Run not found", `process.exit(1)` |
| Missing prerequisite artifact | Stage depends on artifact from prior stage not yet run | Throws `Error("Cannot run SN: <file> not found. Run SN-1 first.")` |
| Gate failure | Gate evaluation returns `all_passed: false` | Stage marked as `"fail"`, pipeline halts with `process.exit(1)` |
| Missing args | `run stage` or `run gates` without required args | Prints usage to stderr, `process.exit(1)` |
| Fatal error | Unhandled exception in `main()` | Caught by top-level `.catch()`, prints `"Fatal error: <message>"`, `process.exit(1)` |

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- ORD-01 (Build Order Graph) — `STAGE_ORDER` / `STAGE_GATES` from `src/types/run.ts`
