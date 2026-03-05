# FEAT-014 — Coverage Scoring Engine: Test Plan

## 1. Unit Tests

### 1.1 scorer.ts — computeCoverage()

- Returns 100% coverage and empty `uncovered` when acceptance map has zero items
- Computes correct coverage percentage when all items are covered by proofs
- Reports uncovered items with reason "no proof entry references this acceptance item" when proofs are missing
- Reports uncovered items with reason listing missing proof types when `required_proof_types` are specified but not all present
- Computes correct `by_category` breakdown for multiple categories
- Rounds coverage percentages to two decimal places
- Handles multiple proofs referencing the same acceptance ref (item counted once)

### 1.2 scorer.ts — parseAcceptanceMap()

- Throws `ERR-COV-002` for null/undefined input
- Throws `ERR-COV-002` for input without `items` array
- Throws `ERR-COV-002` for items missing `item_id`, `category`, or `acceptance_ref`
- Parses valid acceptance map with optional `required_proof_types`

### 1.3 scorer.ts — meetsCoverageThreshold()

- Returns `true` when `coverage_percent >= threshold`
- Returns `false` when `coverage_percent < threshold`
- Returns `true` for exact threshold match

### 1.4 scorer.ts — meetsCategoryThresholds()

- Returns `{ passed: true, failures: [] }` when all categories meet their rules
- Returns failures listing `rule_id`, `category`, `required`, `actual` for categories below threshold
- Reports 0% actual when a category referenced by a rule is not present in the score

### 1.5 rules.ts — loadRules()

- Returns `DEFAULT_RULES` when rules file does not exist
- Parses and returns rules from a valid JSON file
- Throws `ERR-COV-001` when file contains non-array JSON
- Throws `ERR-COV-002` when individual rule objects are malformed

### 1.6 rules.ts — validateRules()

- Returns `true` for valid rules array
- Returns `false` for empty array
- Returns `false` for duplicate `rule_id` values
- Returns `false` for rules with `minimum_coverage` outside 0–100
- Returns `false` for rules with empty `applies_to` array

## 2. Integration Tests

- Compute coverage using proof entries from a `ProofLedger` instance
- Verify coverage scoring integrates with gate engine `coverage_gte` operation
- End-to-end: load rules from file, load acceptance map, compute coverage, check thresholds

## 3. Acceptance Tests

- Determinism: identical inputs always produce identical `CoverageScore`
- All invariants from 01_contract.md verified
- Error codes match 02_errors.md definitions

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (acceptance maps, proof ledger JSONL, coverage rules JSON)
- Helpers: `test/helpers/`
