# FEAT-013 — Ref Integrity Engine: API Surface

## 1. Module Exports

- `src/core/refs/extractor.ts`
- `src/core/refs/resolver.ts`
- `src/core/refs/graph.ts`

## 2. Public Functions

### `extractRefs(artifact, artifactPath)`

- **Module**: `src/core/refs/extractor.ts`
- **Parameters**: `artifact: unknown`, `artifactPath: string`
- **Returns**: `ExtractedRef[]`
- **Behavior**: Recursively walks the artifact object, extracting all string values matching CAN-02 ID patterns (ROLE-NNN, FEAT-NNN, WF-NNN, PERM-NNN, SCR-NNN, DATA-NNN, OP-NNN, INTG-NNN, UNK-NNNN). Returns empty array for null input.

### `extractRefsFromSpec(spec)`

- **Module**: `src/core/refs/extractor.ts`
- **Parameters**: `spec: unknown`
- **Returns**: `ExtractedRef[]`
- **Behavior**: Extracts structural references from canonical spec entity collections (workflows.actor_role_ref, permissions.role_ref, screens.primary_actor_role_ref) with entity ID context, then merges generic refs from `extractRefs()` with deduplication.

### `extractRefsFromTemplate(templateContent, templatePath)`

- **Module**: `src/core/refs/extractor.ts`
- **Parameters**: `templateContent: string`, `templatePath: string`
- **Returns**: `ExtractedRef[]`
- **Behavior**: Scans template string content for CAN-02 ID patterns, includes line numbers in context.

### `resolveRefs(refs, spec)`

- **Module**: `src/core/refs/resolver.ts`
- **Parameters**: `refs: ExtractedRef[]`, `spec: unknown`
- **Returns**: `RefResolutionResult`
- **Behavior**: For each ref, checks the spec index first, then falls back to collection scan. Populates `resolved[]` with target paths and `unresolved[]` with error messages. Sets `all_valid` based on whether `unresolved` is empty.

### `validateRefIntegrity(spec)`

- **Module**: `src/core/refs/resolver.ts`
- **Parameters**: `spec: unknown`
- **Returns**: `Promise<RefResolutionResult>`
- **Behavior**: Combines `extractRefsFromSpec()` + `resolveRefs()` into a single validation call.

### `buildGraph(refs)`

- **Module**: `src/core/refs/graph.ts`
- **Parameters**: `refs: ExtractedRef[]`
- **Returns**: `RefGraph`
- **Behavior**: Builds a directed graph from extracted refs. Creates nodes for both source and target entities, with outgoing/incoming edge lists. Source ID is extracted from ref context when available.

### `detectCycles(graph)`

- **Module**: `src/core/refs/graph.ts`
- **Parameters**: `graph: RefGraph`
- **Returns**: `CycleResult`
- **Behavior**: DFS-based cycle detection using visited and in-stack sets. Returns all cycle paths found.

### `topologicalSort(graph)`

- **Module**: `src/core/refs/graph.ts`
- **Parameters**: `graph: RefGraph`
- **Returns**: `string[]`
- **Behavior**: Kahn's algorithm with sorted queue for deterministic output. Nodes in cycles are omitted from the result.

## 3. Types

| Type | Module | Fields |
|------|--------|--------|
| `ExtractedRef` | extractor.ts | `source_path`, `ref_id`, `ref_type`, `context` |
| `RefResolutionResult` | resolver.ts | `resolved[]`, `unresolved[]`, `all_valid` |
| `RefNode` | graph.ts | `id`, `type`, `outgoing[]`, `incoming[]` |
| `RefGraph` | graph.ts | `nodes: Map<string, RefNode>`, `edges[]` |
| `CycleResult` | graph.ts | `has_cycles`, `cycles: string[][]` |

## 4. Integration Points

- FEAT-001 (Control Plane Core — canonical spec as input)
- FEAT-003 (Gate Engine Core — GATE-04 invokes validation)

## 5. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- CAN-02 (ID Rules, Reference Integrity Rules)
