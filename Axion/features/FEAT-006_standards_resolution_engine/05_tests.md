# FEAT-006 — Standards Resolution Engine: Test Plan

## 1. Unit Tests

### 1.1 registryLoader.ts

- `loadStandardsRegistry()` — loads index, resolver rules, and all packs from a valid library directory
- `loadStandardsRegistry()` — throws when `standards_index.json` is missing
- `loadStandardsRegistry()` — throws when `resolver_rules.v1.json` is missing
- `loadStandardsRegistry()` — throws with `pack_id` context when a referenced pack file is missing

### 1.2 applicability.ts

- `evaluateApplicability()` — universal packs (empty `applies_when`) get `match_score: 1`
- `evaluateApplicability()` — packs matching all routing fields get `match_score: 1`
- `evaluateApplicability()` — packs matching some fields get fractional `match_score`
- `evaluateApplicability()` — packs matching no fields are placed in `unmatched_packs`
- `computeMatchScore()` — case-insensitive matching on routing values
- `computeMatchScore()` — exact matching on gates values
- `getNestedValue()` — traverses dotted paths correctly, returns undefined for missing paths

### 1.3 resolver.ts

- `computeResolverContext()` — extracts routing, gates defaults, delivery scope/priority_bias from normalized input
- `resolveStandards()` — produces deterministic `resolved_standards_id` for same inputs
- `resolveStandards()` — orders packs by priority descending when `priority_direction: "desc"`
- `resolveStandards()` — applies tiebreakers (`pack_id_asc`, `version_asc`) when priorities are equal
- `resolveStandards()` — merges `fixed_rules` and `configurable_rules` from each pack
- `resolveStandards()` — logs all conflicts with resolution rationale
- `resolveConflict()` — `stricter_wins` strategy: fixed rule beats configurable
- `resolveConflict()` — `fixed_over_configurable` strategy: fixed rule beats configurable
- `resolveConflict()` — `last_write_wins` fallback: later pack overrides earlier
- `deriveNamespace()` — maps rule prefixes: SEC→security, QA→quality, ENG→stack, OPS→operations, API→interface, else→general
- `resolveStandards()` — populates `fixed_vs_configurable` map for every rule
- `resolveStandards()` — sorts resolved rules by `rule_id` ascending
- `resolveStandards()` — produces `resolver_trace` entry for every rule encountered

### 1.4 snapshot.ts

- `writeSnapshot()` — writes canonical JSON to `{runDir}/standards/resolved_standards_snapshot.json`
- `loadSnapshot()` — reads and parses snapshot from run directory
- `loadSnapshot()` — throws when snapshot file is missing

## 2. Integration Tests

- Full pipeline: load registry → evaluate applicability → resolve standards → write snapshot → load snapshot → verify round-trip
- Multiple conflicting packs: verify conflict log completeness and correct winner selection
- Empty pack set: verify behavior when no packs match applicability

## 3. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (mock standards library with index, resolver rules, and sample packs)
- Helpers: `test/helpers/`

## 4. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
- 04_gates_and_proofs.md (proof requirements)
