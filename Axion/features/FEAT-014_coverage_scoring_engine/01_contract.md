# FEAT-014 — Coverage Scoring Engine: Contract

## 1. Purpose

Computes coverage scores by comparing acceptance map items against proof ledger entries. Determines what percentage of required acceptance criteria have corresponding proof artifacts, broken down by category, with configurable threshold rules.

## 2. Inputs

- **Acceptance map** (`AcceptanceMap`): Array of `SpecItem` objects, each with `item_id`, `category`, `acceptance_ref`, and optional `required_proof_types`
- **Proof ledger** (`ProofEntry[]`): Array of proof entries from the FEAT-008 proof ledger, each containing `acceptance_refs` and `proof_type`
- **Coverage rules** (`CoverageRule[]`): Configurable rules defining minimum coverage thresholds per category and required proof types
- **Spec** (opaque `unknown`): Reserved for future use by downstream consumers

## 3. Outputs

- **`CoverageScore`**: Object containing:
  - `total_items`: Total acceptance items
  - `covered_items`: Number of items with matching proofs
  - `coverage_percent`: Percentage (0–100, two decimal precision)
  - `by_category`: Per-category breakdown (`{ total, covered, percent }`)
  - `uncovered`: Array of uncovered items with `item_id`, `category`, and `reason`
- **Threshold check result**: Boolean from `meetsCoverageThreshold()`
- **Category threshold result**: `{ passed, failures[] }` from `meetsCategoryThresholds()`

## 4. Invariants

- Coverage scoring is deterministic for identical inputs
- Score reflects actual proof coverage verified by `acceptance_refs` matching
- An item is covered only if a proof entry references its `acceptance_ref` AND all `required_proof_types` (if specified) are present
- Zero coverage is reported explicitly (not omitted) — empty acceptance maps yield 100%
- Coverage percentages are rounded to two decimal places
- `by_category` always includes every category present in the acceptance map
- Coverage rules are loaded from file or fall back to `DEFAULT_RULES`
- Rules must have unique `rule_id` values to pass validation

## 5. Dependencies

- FEAT-001 (Control Plane Core — run context)
- FEAT-008 (Proof Ledger — proof entries with `acceptance_refs`)

## 6. Source Modules

- `src/core/coverage/scorer.ts` — `computeCoverage()`, `meetsCoverageThreshold()`, `meetsCategoryThresholds()`, `parseAcceptanceMap()`, `loadAcceptanceMapFromFile()`
- `src/core/coverage/rules.ts` — `loadRules()`, `validateRules()`, `DEFAULT_RULES`

## 7. Failure Modes

- `ERR-COV-001`: Initialization failure — rules file not found or unparseable, acceptance map file missing
- `ERR-COV-002`: Invalid input — malformed acceptance map, invalid rule structure, missing required fields
- Category threshold failures reported as structured `{ rule_id, category, required, actual }` objects

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- PLAN-02 (Acceptance Map Rules)
- VER-01 (Proof Types & Evidence Rules)
- No directly owned gates
