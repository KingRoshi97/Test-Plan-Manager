# FEAT-014 — Coverage Scoring Engine: API Surface

## 1. Module Exports

- `src/core/coverage/scorer.ts`
- `src/core/coverage/rules.ts`

## 2. Public Functions

### `computeCoverage(spec, proofLedger, acceptanceMap)`

- **Module**: `src/core/coverage/scorer.ts`
- **Parameters**:
  - `spec: unknown` — Reserved for future use
  - `proofLedger: ProofEntry[]` — Array of proof entries from FEAT-008
  - `acceptanceMap: unknown` — Raw acceptance map object (validated via `parseAcceptanceMap`)
- **Returns**: `CoverageScore` — `{ total_items, covered_items, coverage_percent, by_category, uncovered }`
- **Throws**: `ERR-COV-002` if acceptance map is malformed

### `meetsCoverageThreshold(score, threshold)`

- **Module**: `src/core/coverage/scorer.ts`
- **Parameters**:
  - `score: CoverageScore` — Output of `computeCoverage()`
  - `threshold: number` — Minimum required percentage (0–100)
- **Returns**: `boolean`

### `meetsCategoryThresholds(score, rules)`

- **Module**: `src/core/coverage/scorer.ts`
- **Parameters**:
  - `score: CoverageScore` — Output of `computeCoverage()`
  - `rules: CoverageRule[]` — Array of coverage rules
- **Returns**: `{ passed: boolean; failures: Array<{ rule_id, category, required, actual }> }`

### `parseAcceptanceMap(acceptanceMap)`

- **Module**: `src/core/coverage/scorer.ts`
- **Parameters**: `acceptanceMap: unknown` — Raw acceptance map object
- **Returns**: `AcceptanceMap` — `{ items: SpecItem[] }`
- **Throws**: `ERR-COV-002` if structure is invalid

### `loadAcceptanceMapFromFile(filePath)`

- **Module**: `src/core/coverage/scorer.ts`
- **Parameters**: `filePath: string` — Path to acceptance map JSON file
- **Returns**: `AcceptanceMap`
- **Throws**: `ERR-COV-001` if file not found

### `loadRules(rulesPath)`

- **Module**: `src/core/coverage/rules.ts`
- **Parameters**: `rulesPath: string` — Path to coverage rules JSON file
- **Returns**: `CoverageRule[]` — Loaded rules, or `DEFAULT_RULES` if file does not exist
- **Throws**: `ERR-COV-001` if file exists but is not a valid JSON array

### `validateRules(rules)`

- **Module**: `src/core/coverage/rules.ts`
- **Parameters**: `rules: CoverageRule[]` — Array of rules to validate
- **Returns**: `boolean` — `true` if all rules are valid and unique

## 3. Types

### `CoverageScore` (from `scorer.ts`)

```typescript
interface CoverageScore {
  total_items: number;
  covered_items: number;
  coverage_percent: number;
  by_category: Record<string, { total: number; covered: number; percent: number }>;
  uncovered: Array<{ item_id: string; category: string; reason: string }>;
}
```

### `SpecItem` (from `scorer.ts`)

```typescript
interface SpecItem {
  item_id: string;
  category: string;
  acceptance_ref: string;
  required_proof_types?: string[];
}
```

### `AcceptanceMap` (from `scorer.ts`)

```typescript
interface AcceptanceMap {
  items: SpecItem[];
}
```

### `CoverageRule` (from `rules.ts`)

```typescript
interface CoverageRule {
  rule_id: string;
  category: string;
  description: string;
  required_proof_types: string[];
  minimum_coverage: number;
  applies_to: string[];
}
```

## 4. Constants

### `DEFAULT_RULES` (from `rules.ts`)

Three built-in rules:
- `COV-RULE-001`: functional category, 80% minimum, requires P-01 + P-02
- `COV-RULE-002`: security category, 90% minimum, requires P-01 + P-02 + P-06
- `COV-RULE-003`: integration category, 70% minimum, requires P-01 + P-02

## 5. Error Codes

See 02_errors.md: `ERR-COV-001` (initialization), `ERR-COV-002` (invalid input)

## 6. Integration Points

- FEAT-001 (Control Plane Core — run context)
- FEAT-003 (Gate Engine Core — `coverage_gte` evaluator operation)
- FEAT-008 (Proof Ledger — `ProofEntry` with `acceptance_refs`)

## 7. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
