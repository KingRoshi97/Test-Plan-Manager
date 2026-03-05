# FEAT-013 — Ref Integrity Engine: Gates & Proofs

## 1. Applicable Gates

### GATE-04 — Spec Gate (Truth Integrity)

The Ref Integrity Engine is the primary implementer of GATE-04's referential integrity checks:

- `extractRefsFromSpec()` extracts all cross-entity references from the canonical spec
- `resolveRefs()` validates every extracted reference resolves to an existing entity
- `validateRefIntegrity()` combines extraction + resolution into a single call
- `buildGraph()` + `detectCycles()` verify the reference graph is acyclic for dependency references

**Gate pass condition**: `validateRefIntegrity(spec).all_valid === true` AND `detectCycles(buildGraph(refs)).has_cycles === false`

## 2. Required Proof Types

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | Output of `validateRefIntegrity()` showing `all_valid: true` |
| P-02 | Test Result Proof | Unit test results for extractor, resolver, graph modules |
| P-05 | Diff/Commit Reference Proof | Code changes to ref integrity modules |

## 3. Gate Report Contract

Every gate produces a report per ORD-02 Section 7:

- `gate_id` — `GATE-04`
- `target` — Canonical spec artifact path
- `status` — pass | fail
- `executed_at` — Timestamp
- `issues[]` — Array of issue objects for each unresolved reference or detected cycle

## 4. Evidence Artifacts

| Artifact | Content |
|----------|---------|
| `ref_resolution_result.json` | Full `RefResolutionResult` from `validateRefIntegrity()` |
| `ref_graph.json` | Serialized `RefGraph` (nodes as entries, edges array) |
| `cycle_result.json` | `CycleResult` from `detectCycles()` |

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
