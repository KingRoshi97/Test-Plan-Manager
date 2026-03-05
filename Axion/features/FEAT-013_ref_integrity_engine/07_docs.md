# FEAT-013 — Ref Integrity Engine: Documentation Requirements

## 1. API Documentation

All exported functions have JSDoc-compatible signatures:

### extractor.ts
- `extractRefs(artifact: unknown, artifactPath: string): ExtractedRef[]`
- `extractRefsFromSpec(spec: unknown): ExtractedRef[]`
- `extractRefsFromTemplate(templateContent: string, templatePath: string): ExtractedRef[]`

### resolver.ts
- `resolveRefs(refs: ExtractedRef[], spec: unknown): RefResolutionResult`
- `validateRefIntegrity(spec: unknown): Promise<RefResolutionResult>`

### graph.ts
- `buildGraph(refs: ExtractedRef[]): RefGraph`
- `detectCycles(graph: RefGraph): CycleResult`
- `topologicalSort(graph: RefGraph): string[]`

## 2. Architecture Documentation

- **Data flow**: Canonical spec → `extractRefsFromSpec()` → `resolveRefs()` → `RefResolutionResult`
- **Graph flow**: `ExtractedRef[]` → `buildGraph()` → `detectCycles()` / `topologicalSort()`
- **Integration**: GATE-04 calls `validateRefIntegrity()` during spec truth integrity check

## 3. Type Exports

| Type | Module | Description |
|------|--------|-------------|
| `ExtractedRef` | extractor.ts | Single reference with source, ID, type, context |
| `RefResolutionResult` | resolver.ts | Resolution outcome with resolved/unresolved arrays |
| `RefNode` | graph.ts | Graph node with ID, type, outgoing/incoming edges |
| `RefGraph` | graph.ts | Complete directed graph (nodes Map + edges array) |
| `CycleResult` | graph.ts | Cycle detection result |

## 4. Cross-References

- CAN-02 (ID Rules — defines valid ID patterns)
- CAN-02 (Reference Integrity Rules — defines ref field paths)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
