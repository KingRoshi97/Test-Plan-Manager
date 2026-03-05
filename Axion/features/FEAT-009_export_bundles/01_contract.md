# FEAT-009 — Export Bundles: Contract

## 1. Purpose

Assembles pipeline run outputs into a distributable agent kit folder with metadata files, core artifacts, rendered documents organized into 12 domain slots, and integrity manifests with SHA-256 hashes.

## 2. Inputs

- `runDir` — Path to the pipeline run directory containing subdirectories: `intake/`, `canonical/`, `standards/`, `templates/`, `planning/`, `state/`
- `runId` — Unique run identifier string
- `generatedAt` — ISO timestamp for when generation was triggered
- `baseDir` — Base directory of the Axion repository
- Core artifacts read from `runDir`:
  - `intake/normalized_input.json`
  - `canonical/canonical_spec.json`
  - `standards/resolved_standards_snapshot.json`
  - `templates/selection_result.json`
  - `templates/rendered_docs/*.md`
  - `planning/work_breakdown.json`
  - `planning/acceptance_map.json`
  - `state/state_snapshot.json`

## 3. Outputs

- `kit/bundle/agent_kit/` — Agent kit folder containing:
  - `00_START_HERE.md` — Orientation document with reading order and execution loop
  - `00_KIT_MANIFEST.md` — Manifest with kit_id, run_id, spec_id, reading_order, core_artifacts paths
  - `00_KIT_INDEX.md` — Index listing core artifacts and all 12 app pack slots
  - `00_VERSIONS.md` — Version stamps (V-01 through V-07) for system, intake, standards, templates, canonical, planning, kit
  - `00_RUN_RULES.md` — Six execution rules for agents
  - `00_PROOF_LOG.md` — Empty proof log table for tracking evidence
  - `01_core_artifacts/` — Six numbered JSON files (01–06)
  - `10_app/` — Rendered documents organized into 12 domain slots
    - `00_pack_meta.md`, `00_pack_index.md`, `00_gate_checklist.md`
    - Per-slot directories with rendered docs or `00_NA.md` markers
- `kit/kit_manifest.json` — JSON manifest with file list, SHA-256 hashes, and byte counts
- `kit/entrypoint.json` — Entry point with kit_root and start_here paths
- `kit/version_stamp.json` — Version data with kit_id, run_id, versions, generated_at
- `kit/packaging_manifest.json` — SHA-256 hash manifest for all files in the kit
- `KitBuildResult` — Return value: `{ fileCount: number; contentHash: string }`

## 4. Invariants

- Kit structure always contains all 12 domain slots under `10_app/`
- Empty slots always get a `00_NA.md` file with reason text (no silent omissions)
- All 6 core artifacts are always present; missing source files produce `{ note: "not available" }` placeholder
- `kit_manifest.json` lists every file with a valid SHA-256 hash and byte count
- `packaging_manifest.json` contains SHA-256 hashes for every file in `agent_kit/`
- `contentHash` is the SHA-256 of the canonical JSON serialization of `[{ path, sha256 }]` array
- Kit ID follows pattern `KIT-{runId}`
- Reading order in manifest is deterministic and fixed
- Version stamps V-01 through V-07 are always present, defaulting to `"1.0.0"` when source data is unavailable
- Rendered documents are mapped to slots via `SUBDIR_TO_SLOT` lookup or keyword-based fallback; unmapped docs go to `11_documentation`

## 5. Dependencies

- FEAT-001 (Control Plane Core — provides run state)
- FEAT-003 (Gate Engine Core — produces gate reports referenced in gate_checklist)
- FEAT-004 (Artifact Store — artifact persistence)

## 6. Source Modules

- `src/core/kit/build.ts` — Primary logic: `buildRealKit()`, `APP_SLOTS`, `SUBDIR_TO_SLOT`, `slotForOutputPath()`, all `build*Md()` helpers
- `src/core/kit/schemas.ts` — Type definitions: `KitManifest`, `KitArtifactEntry`, `Entrypoint`, `VersionStamp`
- `src/core/kit/manifest.ts` — `createPlaceholderKitManifest()`, `writeKitManifest()`
- `src/core/kit/entrypoint.ts` — `createPlaceholderEntrypoint()`, `writeEntrypoint()`
- `src/core/kit/versions.ts` — `createPlaceholderVersionStamp()`, `writeVersionStamp()`
- `src/core/kit/layout.ts` — `createKitLayout()` (creates `kit/` directory)
- `src/core/kit/validate.ts` — `validateKit()` (stub — throws `NotImplementedError`)
- `src/core/kit/packager.ts` — `packageKit()` (stub — throws `NotImplementedError`)
- `src/core/kit/index.ts` — Barrel re-exports for all public API
- `src/cli/commands/exportBundle.ts` — `cmdExportBundle()` (stub — throws `NotImplementedError`)

## 7. Failure Modes

- Source core artifact files missing → gracefully handled with `{ note: "not available" }` placeholder
- `canonical_spec.json` missing → spec_id defaults to `"SPEC-UNKNOWN"`, project name to `"Axion Generated Project"`
- `rendered_docs/` directory missing → all slots get `00_NA.md` markers
- `selection_result.json` missing → rendered docs use filename as output_path fallback
- `validateKit()` called → throws `NotImplementedError` (unimplemented stub)
- `packageKit()` called → throws `NotImplementedError` (unimplemented stub)
- `cmdExportBundle()` called → throws `NotImplementedError` (unimplemented stub)
- File system write failure → propagates as uncaught I/O error

## 8. Cross-References

- KIT-01 (Kit Folder Structure Contract) — defines the folder layout
- KIT-02 (Manifest & Index Format) — defines manifest structure
- KIT-03 (Entrypoint Contract) — defines entrypoint format
- KIT-04 (Version Stamping Rules) — defines version stamp format
- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- GATE-08 — Packaging Gate (Kit Contract)
