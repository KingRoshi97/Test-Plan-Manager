# FEAT-003 — Gate Engine Core: Contract

## 1. Purpose

Deterministic gate evaluation engine that enforces pass/fail checks on artifacts and stage outputs across the Axion pipeline. The engine loads gate definitions from `GATE_REGISTRY.json`, evaluates checks using 6 registered operators, produces structured `GateReportV1` reports with evidence entries, and blocks pipeline progression on failure. Eight gates (G1–G8) cover the full pipeline from intake through packaging.

## 2. Inputs

| Input | Type | Source |
|-------|------|--------|
| Gate registry | `GateRegistryFile` | `registries/GATE_REGISTRY.json` |
| Run ID | `string` | Pipeline run context |
| Stage ID | `string` | Current pipeline stage |
| Artifact files | JSON files on disk | Stage outputs |
| Run manifest | `RunManifest` | `.axion/runs/{run_id}/run_manifest.json` |

## 3. Outputs

| Output | Type | Location |
|--------|------|----------|
| Gate reports | `GateReportV1` | `.axion/runs/{run_id}/gates/{gate_id}.gate_report.json` |
| Updated run manifest | `RunManifest` | `.axion/runs/{run_id}/run_manifest.json` (gate_reports array appended) |
| Console log | stdout | `PASS {gate_id}` or `FAIL {gate_id}: {failure_code}` |

## 4. Invariants

- Gate evaluation is deterministic — same inputs always produce the same `GateReportV1`
- Only 6 registered operators are permitted: `file_exists`, `json_valid`, `json_has`, `json_eq`, `coverage_gte`, `verify_hash_manifest`
- Unregistered operators produce immediate `E_UNKNOWN_OP` failure
- Every check failure includes a `failure_code` and `evidence[]` with path, pointer, and details
- Gate reports are written via `writeCanonicalJson` (deterministic serialization)
- On first check failure within a gate, evaluation short-circuits (remaining checks are skipped)
- On gate failure, the stage halts and `runGatesForStage` returns `all_passed: false`
- Gate paths support `{{run_id}}` template substitution and base-directory prefixing
- Evidence completeness is evaluated per gate using `GATE_EVIDENCE_MAP`
- The run manifest `gate_reports` array is appended for every gate evaluated

## 5. Dependencies

- FEAT-001 (Control Plane Core — provides `RunManifest` type and run directory structure)

## 6. Source Modules

| Module | Role |
|--------|------|
| `src/core/gates/evaluator.ts` | 6 operator implementations + `evalCheck` dispatcher |
| `src/core/gates/registry.ts` | Gate registry loading, stage filtering, `{{run_id}}` path templating |
| `src/core/gates/report.ts` | `GateReportV1` type, `writeGateReport`, `deriveTarget`, `checksToIssues` |
| `src/core/gates/reports.ts` | Re-exports from `report.ts` |
| `src/core/gates/run.ts` | `runGatesForStage` — orchestrates evaluation per stage |
| `src/core/gates/runner.ts` | Re-exports from `run.ts` |
| `src/core/gates/evidencePolicy.ts` | Evidence-completeness evaluation, proof-type registry loading |
| `src/core/gates/dsl.ts` | `GateAST`/`GateCondition` types + `parseGate`/`evalGate` stubs (future DSL) |
| `src/core/gates/evidence.ts` | Reserved module (empty) |
| `src/core/gates/index.ts` | Barrel re-exports for all public API |

## 7. Failure Modes

- Unregistered operator → `E_UNKNOWN_OP`
- Gate registry file missing or invalid JSON → exception from `readJson`
- Artifact file missing → `E_FILE_MISSING`
- Artifact file not valid JSON → `E_JSON_INVALID`
- Required JSON field missing → `E_REQUIRED_FIELD_MISSING`
- JSON field value mismatch → `E_VALUE_MISMATCH`
- Coverage field missing/non-numeric → `E_COVERAGE_FIELD_INVALID`
- Coverage below threshold → `E_COVERAGE_BELOW_MIN`
- Hash manifest errors → `E_PACK_MANIFEST_MISSING`, `E_PACK_MANIFEST_INVALID_JSON`, `E_PACK_MANIFEST_BAD_ALGORITHM`, `E_PACK_MANIFEST_FILES_INVALID`, `E_PACK_ENTRY_INVALID`, `E_PACK_ENTRY_PATH_INVALID`, `E_PACK_ENTRY_HASH_INVALID`, `E_PACK_BUNDLE_FILE_MISSING`, `E_PACK_BUNDLE_FILE_UNREADABLE`, `E_PACK_HASH_MISMATCH`

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-001 (Control Plane Core — RunManifest)
