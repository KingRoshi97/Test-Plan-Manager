# FEAT-014 — Coverage Scoring Engine: Documentation Requirements

## 1. API Documentation

- `computeCoverage(spec, proofLedger, acceptanceMap)` — Computes coverage score from proof entries and acceptance map
- `meetsCoverageThreshold(score, threshold)` — Checks if aggregate coverage meets a numeric threshold
- `meetsCategoryThresholds(score, rules)` — Checks per-category thresholds against coverage rules
- `parseAcceptanceMap(raw)` — Validates and parses raw acceptance map object
- `loadAcceptanceMapFromFile(filePath)` — Loads acceptance map from JSON file
- `loadRules(rulesPath)` — Loads coverage rules from JSON file, falls back to DEFAULT_RULES
- `validateRules(rules)` — Validates rule array structure and uniqueness

## 2. Architecture Documentation

- Data flow: Acceptance Map + Proof Ledger → `computeCoverage()` → `CoverageScore` → `meetsCoverageThreshold()` / `meetsCategoryThresholds()`
- Integration: Called by gate engine (FEAT-003) during G6 PLAN-COVERAGE evaluation
- Dependency: Proof entries from FEAT-008 proof ledger provide `acceptance_refs` and `proof_type`

## 3. Operator Documentation

- Coverage rules file format: JSON array of `CoverageRule` objects
- Default rules: `COV-RULE-001` (functional, 80%), `COV-RULE-002` (security, 90%), `COV-RULE-003` (integration, 70%)
- Troubleshooting: `ERR-COV-001` = config/file issue, `ERR-COV-002` = input validation failure

## 4. Change Log

- v1.0.0: Initial implementation — `computeCoverage`, `meetsCoverageThreshold`, `meetsCategoryThresholds`, `loadRules`, `validateRules`

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- PLAN-02 (Acceptance Map Rules)
