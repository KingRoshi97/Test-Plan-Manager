# FEAT-016 — Minimal Repro Exporter: Test Plan

## 1. Unit Tests

### 1.1 selector.ts — `selectReproArtifacts()`

- Returns `ReproSelection` with `run_id` extracted from `run_manifest.json`
- Falls back to directory basename when `run_manifest.json` is missing or malformed
- In minimal mode: selects core artifacts (`run_manifest.json`, `artifact_index.json`, `canonical/canonical_spec.json`, `standards/resolved_standards_snapshot.json`)
- In minimal mode: includes `stage_reports/*.json` when `include_stage_reports` is true
- In minimal mode: includes `gates/*.gate_report.json` when `include_gate_reports` is true
- In minimal mode: includes verification artifacts when `include_proof_ledger` is true
- In minimal mode: excludes planning, state, and supplementary artifacts not matching filters
- In full mode (`minimal: false`): includes all non-sensitive artifacts
- Always excludes files matching sensitive patterns (`.env`, `secret`, `credentials`, `private_key`)
- Excluded sensitive files appear with reason `"sensitive_content"`
- Non-selected files in minimal mode appear with reason `"not_required_for_minimal_repro"`
- Each selected artifact has a SHA-256 `hash` field
- Throws `ERR-REPRO-001` when `runDir` does not exist
- Returns empty selection for empty run directory

### 1.2 builder.ts — `buildReproPackage()`

- Copies all selected artifacts from source to output directory
- Creates subdirectories as needed in output path
- Writes `repro_manifest.json` in canonical JSON format to output directory
- `repro_id` is deterministic for same `run_id + timestamp`
- `content_hash` is SHA-256 of sorted artifact hashes joined with `:`
- `artifacts_included` reflects actual copied count (skips missing files)
- Throws `ERR-REPRO-002` when `runDir` does not exist
- Throws `ERR-REPRO-003` when `selected_artifacts` is empty

### 1.3 Edge Cases

- Run directory with no artifacts → `ERR-REPRO-003` at build time
- Run directory with only sensitive files → empty selection, `ERR-REPRO-003` at build time
- Artifact file deleted between selection and build → silently skipped, count decremented

## 2. Integration Tests

- End-to-end: `cmdRepro(runDir)` produces a valid repro directory with manifest
- Repro manifest can be parsed and all listed artifact paths exist in output
- `content_hash` matches re-computed hash from output artifacts

## 3. Acceptance Tests

- Repro bundle is self-contained — all referenced artifacts present
- Sensitive files never appear in output directory
- `repro_manifest.json` is valid JSON and parseable

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (mock run directories)
- Helpers: `test/helpers/`
