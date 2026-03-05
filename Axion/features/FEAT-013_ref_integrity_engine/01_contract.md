# FEAT-013 — Ref Integrity Engine: Contract

## 1. Purpose

Extracts cross-references from canonical specs, templates, and arbitrary artifacts, resolves them against the spec's entity collections and indexes, builds a directed reference graph, and detects broken links and cycles.

## 2. Inputs

| Input | Type | Source |
|-------|------|--------|
| Canonical spec object | `Record<string, unknown>` | Pipeline stage output (GATE-04 target) |
| Artifact object + path | `unknown` + `string` | Any JSON/object artifact |
| Template content + path | `string` + `string` | Template file content |
| Extracted refs array | `ExtractedRef[]` | Output of extractor functions |
| Reference graph | `RefGraph` | Output of `buildGraph()` |

## 3. Outputs

| Output | Type | Description |
|--------|------|-------------|
| `ExtractedRef[]` | Array | All references found, with source path, ref ID, ref type, and context |
| `RefResolutionResult` | Object | Resolved refs with target paths, unresolved refs with error messages, `all_valid` boolean |
| `RefGraph` | Object | Directed graph with `nodes` (Map) and `edges` array |
| `CycleResult` | Object | `has_cycles` boolean and `cycles` array of node ID chains |
| `string[]` | Array | Topologically sorted node IDs (deterministic) |

## 4. Invariants

- Reference extraction is deterministic: same input always produces same `ExtractedRef[]` output
- All references matching CAN-02 ID patterns (ROLE-NNN, FEAT-NNN, WF-NNN, PERM-NNN, SCR-NNN, DATA-NNN, OP-NNN, INTG-NNN, UNK-NNNN) are extracted
- Structural refs from `extractRefsFromSpec()` include context with source entity ID
- `resolveRefs()` checks both the spec index and the entity collection for each ref
- `all_valid` is true if and only if `unresolved` array is empty
- `buildGraph()` creates nodes for both source and target of every reference
- `detectCycles()` finds all cycles via DFS with back-edge detection
- `topologicalSort()` produces a deterministic ordering (sorted queue breaks ties)
- Topological sort omits nodes involved in cycles (returns partial order)

## 5. Dependencies

- FEAT-001 (Control Plane Core — provides canonical spec structure)
- FEAT-003 (Gate Engine Core — GATE-04 uses ref integrity)

## 6. Source Modules

- `src/core/refs/extractor.ts` — Reference extraction from specs, artifacts, templates
- `src/core/refs/resolver.ts` — Reference resolution and validation against spec
- `src/core/refs/graph.ts` — Graph construction, cycle detection, topological sort

## 7. Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Spec is null/non-object | Returns empty results or all-unresolved | Null-safe guards in all functions |
| Unknown ref type | Ref added to `unresolved` with error | INDEX_MAP lookup returns explicit error |
| Circular references | `detectCycles()` returns all cycle paths | DFS with in-stack tracking |
| Missing index in spec | Falls back to collection scan | `findInCollection()` as secondary lookup |

## 8. Cross-References

- CAN-01 (Canonical Spec Schema — entity structure and ID fields)
- CAN-02 (ID Rules — ID patterns and prefixes)
- CAN-02 (Reference Integrity Rules — field-level ref definitions)
- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- GATE-04 — Spec Gate (Truth Integrity)
