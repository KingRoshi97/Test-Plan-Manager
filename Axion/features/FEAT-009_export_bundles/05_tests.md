# FEAT-009 — Export Bundles: Test Plan

## 1. Unit Tests

### 1.1 `buildRealKit()` — Core Build

- Verify kit directory structure created at `runDir/kit/bundle/agent_kit/`
- Verify all 6 metadata files generated: `00_START_HERE.md`, `00_KIT_MANIFEST.md`, `00_KIT_INDEX.md`, `00_VERSIONS.md`, `00_RUN_RULES.md`, `00_PROOF_LOG.md`
- Verify `01_core_artifacts/` contains 6 numbered JSON files (01–06)
- Verify `10_app/` contains all 12 domain slot directories
- Verify empty slots get `00_NA.md` with slot name and reason
- Verify `kit_manifest.json` lists all files with SHA-256 hashes and byte counts
- Verify `entrypoint.json` has `kit_root` and `start_here` fields
- Verify `version_stamp.json` has `kit_id`, `run_id`, `versions`, `generated_at`
- Verify `packaging_manifest.json` has `algorithm: "sha256"` and `files[]`
- Verify return value `{ fileCount, contentHash }` is correct
- Verify `contentHash` is deterministic for same inputs

### 1.2 `slotForOutputPath()` — Slot Mapping

- Verify `SUBDIR_TO_SLOT` maps known subdirectory names to correct slots (e.g., `requirements` → `01_requirements`, `architecture` → `02_architecture`)
- Verify keyword fallback: path containing "api" maps to `04_api_contracts`, "test" maps to `09_testing`, etc.
- Verify `10_app/` prefix stripping works correctly
- Verify unmapped paths return `null` (defaults to `11_documentation` in buildRealKit)

### 1.3 Graceful Degradation

- Verify missing `canonical_spec.json` → `spec_id` defaults to `"SPEC-UNKNOWN"`, project name to `"Axion Generated Project"`
- Verify missing core artifacts → placeholder `{ note: "not available" }` written
- Verify missing `rendered_docs/` → all 12 slots get `00_NA.md`
- Verify missing `selection_result.json` → version defaults applied

### 1.4 Placeholder Functions

- `createPlaceholderKitManifest(runId)` → verify returns `KitManifest` with `kit_id: "kit_{runId}"`, version `"0.0.0"`, empty `artifacts[]`
- `createPlaceholderEntrypoint(runId)` → verify returns `Entrypoint` with `entry_type: "placeholder"`, empty `instructions[]`
- `createPlaceholderVersionStamp(runId)` → verify returns `VersionStamp` with zero hashes, version `"0.0.0"`
- `createKitLayout(runDir)` → verify creates `kit/` directory under runDir

### 1.5 Stub Behavior

- `validateKit()` → verify throws `NotImplementedError`
- `packageKit()` → verify throws `NotImplementedError`
- `cmdExportBundle()` → verify throws `NotImplementedError`

## 2. Integration Tests

- Full pipeline run through `buildRealKit()` with realistic run directory
- Verify rendered docs distributed across correct domain slots
- Verify SHA-256 hashes in `kit_manifest.json` match actual file contents
- Verify `packaging_manifest.json` hashes are consistent with `kit_manifest.json`

## 3. Acceptance Tests

- All 12 APP_SLOTS directories exist in every kit
- No slot directory is empty without an `00_NA.md` file
- `00_START_HERE.md` contains correct run ID and spec ID
- Gate checklist references all 8 gates (G1–G8)
- Version stamps cover all 7 version categories (V-01 through V-07)

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` — mock run directories with sample artifacts
- Helpers: `test/helpers/` — run directory scaffolding utilities
