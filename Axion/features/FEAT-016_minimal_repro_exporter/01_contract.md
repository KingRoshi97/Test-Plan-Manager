# FEAT-016 — Minimal Repro Exporter: Contract

## 1. Purpose

Selects the minimal set of artifacts from a pipeline run directory needed to reproduce the run result and packages them into a self-contained repro bundle with a content-integrity manifest.

## 2. Inputs

| Input | Type | Source |
|-------|------|--------|
| `runDir` | `string` | Filesystem path to a completed run directory |
| `options.minimal` | `boolean` (default `true`) | When true, only core + stage/gate reports included |
| `options.include_stage_reports` | `boolean` (default `true`) | Include `stage_reports/*.json` |
| `options.include_gate_reports` | `boolean` (default `true`) | Include `gates/*.gate_report.json` |
| `options.include_proof_ledger` | `boolean` (default `true`) | Include verification artifacts |
| `options.stages` | `string[]` (optional) | Restrict to artifacts matching these stage names |
| `outputPath` | `string` | Destination directory for the repro package |

## 3. Outputs

| Output | Type | Description |
|--------|------|-------------|
| `ReproSelection` | object | Selection result with `run_id`, `selected_artifacts[]`, `excluded_artifacts[]`, `total_size_bytes` |
| `ReproPackage` | object | Package result with `repro_id`, `run_id`, `created_at`, `output_path`, `artifacts_included`, `total_size_bytes`, `content_hash`, `manifest` |
| `repro_manifest.json` | file | Written to `outputPath/repro_manifest.json` containing the `ReproPackage` data |

## 4. Invariants

- Core artifacts (`run_manifest.json`, `artifact_index.json`, `canonical/canonical_spec.json`, `standards/resolved_standards_snapshot.json`) are always selected in minimal mode
- Sensitive files matching known patterns (`.env`, `secret`, `credentials`, `private_key`) are always excluded
- Every selected artifact includes a SHA-256 hash for integrity verification
- The repro package `content_hash` is derived from sorted artifact hashes, ensuring deterministic output for identical inputs
- `repro_manifest.json` is always written to the output directory using canonical JSON formatting
- The `repro_id` is deterministically generated from `run_id + timestamp`

## 5. Dependencies

- FEAT-001 (Control Plane Core — provides run directory structure and `run_manifest.json`)
- FEAT-004 (Artifact Store & Registry — provides artifact hashing patterns)

## 6. Source Modules

- `src/core/repro/selector.ts` — artifact selection logic
- `src/core/repro/builder.ts` — repro package assembly
- `src/cli/commands/repro.ts` — CLI entry point

## 7. Failure Modes

| Failure | Error Code | Cause |
|---------|------------|-------|
| Run directory missing | `ERR-REPRO-001` | `runDir` path does not exist |
| Run directory missing (builder) | `ERR-REPRO-002` | `runDir` path does not exist during build |
| Empty selection | `ERR-REPRO-003` | No artifacts matched selection criteria |
| Source artifact missing | (skipped silently) | Individual artifact file missing during copy — skipped, count reflects actual copies |

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- No directly owned gates
