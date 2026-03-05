# FEAT-003 — Gate Engine Core: Test Plan

## 1. Unit Tests

### 1.1 Evaluator — `evalCheck()` (evaluator.ts)

- `file_exists` — returns `pass: true` for existing file
- `file_exists` — returns `E_FILE_MISSING` for non-existent file
- `json_valid` — returns `pass: true` for valid JSON file
- `json_valid` — returns `E_FILE_MISSING` for missing file
- `json_valid` — returns `E_JSON_INVALID` for malformed JSON
- `json_has` — returns `pass: true` when pointer resolves
- `json_has` — returns `E_REQUIRED_FIELD_MISSING` when pointer does not resolve
- `json_has` — handles nested pointer paths (`/a/b/c`)
- `json_eq` — returns `pass: true` when value matches expected
- `json_eq` — returns `E_VALUE_MISMATCH` when value differs
- `json_eq` — returns `E_REQUIRED_FIELD_MISSING` when field absent
- `coverage_gte` — returns `pass: true` when value >= min
- `coverage_gte` — returns `E_COVERAGE_BELOW_MIN` when value < min
- `coverage_gte` — returns `E_COVERAGE_FIELD_INVALID` when field is not a number
- `verify_hash_manifest` — returns `pass: true` for valid manifest with matching hashes
- `verify_hash_manifest` — returns `E_PACK_MANIFEST_MISSING` when manifest not found
- `verify_hash_manifest` — returns `E_PACK_MANIFEST_BAD_ALGORITHM` for non-sha256 algorithm
- `verify_hash_manifest` — returns `E_PACK_HASH_MISMATCH` on hash mismatch
- `verify_hash_manifest` — returns `E_PACK_ENTRY_PATH_INVALID` for path traversal attempts
- Unregistered operator → `E_UNKNOWN_OP` with registered ops listed in evidence

### 1.2 Registry — `loadGateRegistry()`, `filterGatesByStage()`, `templateGatePaths()` (registry.ts)

- `loadGateRegistry` — loads and returns `GateDefinition[]` from JSON file
- `filterGatesByStage` — filters gates by `stage_id`
- `filterGatesByStage` — returns empty array when no gates match
- `templateGatePaths` — replaces `{{run_id}}` in all string fields recursively

### 1.3 Report — `writeGateReport()`, `deriveTarget()`, `checksToIssues()` (report.ts)

- `deriveTarget` — returns correct artifact path for each gate ID (G1–G8)
- `deriveTarget` — returns `"run_manifest.json"` for unknown gate IDs
- `checksToIssues` — converts failed checks to `GateIssue[]` with sequential `issue_id`
- `checksToIssues` — produces no issues for all-passing checks

### 1.4 Evidence Policy (evidencePolicy.ts)

- `getRequiredProofTypes` — returns correct proof types for each gate
- `getRequiredProofTypes` — returns empty array for unknown gates
- `evaluateEvidenceCompleteness` — `complete: true` when all types satisfied
- `evaluateEvidenceCompleteness` — `complete: false` with correct `missing` list

### 1.5 Pointer Resolution (evaluator.ts internal)

- Empty pointer (`""`) returns root object
- Root pointer (`"/"`) returns root object
- Multi-level pointer resolves correctly
- Non-existent path returns `{ found: false }`
- Null intermediate value returns `{ found: false }`

## 2. Integration Tests

- `runGatesForStage` — full pass scenario: all checks pass, reports written, manifest updated
- `runGatesForStage` — failure scenario: first check fails, gate halts, `all_passed: false`
- `runGatesForStage` — stage with no gates returns `{ reports: [], all_passed: true }`
- `runGatesForStage` — multiple gates for same stage evaluated in sequence
- Path prefixing: checks resolve correctly with non-`.` base directory

## 3. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (sample gate registries, artifacts, manifests)
- Helpers: `test/helpers/` (temp directory setup, fixture generators)

## 4. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
- 04_gates_and_proofs.md (gate map and evidence completeness)
