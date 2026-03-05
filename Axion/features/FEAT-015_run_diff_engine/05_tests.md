# FEAT-015 — Run Diff Engine: Test Plan

## 1. Unit Tests

### 1.1 `diffRuns()`

- Two identical directories → all entries `unchanged`, summary counts match
- Directory with added files → entries contain `added` with `current_hash` only
- Directory with removed files → entries contain `removed` with `previous_hash` only
- Directory with modified files → entries contain `modified` with both hashes differing
- Mixed changes → summary counts are consistent with entry array
- Entries are sorted alphabetically by `path`
- Run ID extracted from `manifest.json` when present
- Run ID falls back to directory name when `manifest.json` absent
- `diffed_at` is a valid ISO-8601 timestamp
- Nested subdirectories are recursed and relative paths are correct

### 1.2 `diffRuns()` Error Cases

- Non-existent previous directory → throws `ERR-DIFF-001`
- Non-existent current directory → throws `ERR-DIFF-001`
- Path points to a file, not directory → throws `ERR-DIFF-002`

### 1.3 `classifySingleChange()`

- Manifest/index/schema files → `structural`
- Added or removed files → `structural`
- Files in `.axion/`, `state/`, `gate_reports/` → `metadata`
- `.css`/`.scss` files → `formatting`
- Modified `.md`/`.ts`/`.json` content files → `content`
- Unchanged entries → `unknown`

### 1.4 `classifyChanges()`

- Returns new array with `classification` field set on every entry
- Original entries are not mutated
- All entries receive a valid `ChangeClassification` value

## 2. Integration Tests

- End-to-end: create two temp run directories, run `diffRuns()` then `classifyChanges()`, verify complete report
- Large directory (100+ files) completes without error

## 3. Acceptance Tests

- Determinism: calling `diffRuns()` twice on same directories produces identical entries
- Empty directories produce zero-count summary
- All invariants from 01_contract.md are satisfied

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: Temporary directories created in `test/fixtures/`
- Helpers: `test/helpers/`

## 5. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
