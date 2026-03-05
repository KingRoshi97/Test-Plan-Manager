# FEAT-013 — Ref Integrity Engine: Test Plan

## 1. Unit Tests

### 1.1 extractor.ts

- `extractRefs()` — extracts ROLE-NNN, FEAT-NNN, WF-NNN refs from nested object
- `extractRefs()` — extracts refs from string values, arrays, and nested objects
- `extractRefs()` — returns empty array for null/undefined input
- `extractRefs()` — extracts multiple refs from a single string value
- `extractRefsFromSpec()` — extracts structural refs (actor_role_ref, role_ref, primary_actor_role_ref) from canonical spec entities
- `extractRefsFromSpec()` — includes context with source entity ID (e.g., "from WF-001")
- `extractRefsFromSpec()` — deduplicates refs found both structurally and generically
- `extractRefsFromSpec()` — returns empty array for null spec
- `extractRefsFromTemplate()` — extracts ID-pattern refs from template string content
- `extractRefsFromTemplate()` — includes line number in context
- `extractRefsFromTemplate()` — returns empty array for empty string

### 1.2 resolver.ts

- `resolveRefs()` — resolves refs found in spec index
- `resolveRefs()` — falls back to collection scan when index is missing
- `resolveRefs()` — marks refs as unresolved when not found in index or collection
- `resolveRefs()` — sets `all_valid: true` when all refs resolve
- `resolveRefs()` — sets `all_valid: false` when any ref is unresolved
- `resolveRefs()` — handles unknown ref types gracefully
- `resolveRefs()` — returns all unresolved when spec is null
- `validateRefIntegrity()` — combines extraction and resolution in one call
- `validateRefIntegrity()` — returns `all_valid: true` for valid spec with no broken refs

### 1.3 graph.ts

- `buildGraph()` — creates nodes for source and target entities
- `buildGraph()` — creates edges with labels from ref context
- `buildGraph()` — handles empty refs array (returns empty graph)
- `detectCycles()` — returns `has_cycles: false` for acyclic graph
- `detectCycles()` — returns `has_cycles: true` with cycle paths for cyclic graph
- `detectCycles()` — handles self-referencing nodes
- `topologicalSort()` — returns deterministic ordering for DAG
- `topologicalSort()` — returns partial order when cycles exist (omits cycle nodes)
- `topologicalSort()` — handles empty graph

## 2. Integration Tests

- Extract refs from a full canonical spec fixture, resolve all, verify `all_valid`
- Introduce a broken ref in fixture, verify it appears in `unresolved`
- Build graph from canonical spec refs, verify no cycles
- Introduce a circular workflow→role→permission→workflow ref chain, verify cycle detection

## 3. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (canonical spec fixtures)
- Helpers: `test/helpers/`

## 4. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
