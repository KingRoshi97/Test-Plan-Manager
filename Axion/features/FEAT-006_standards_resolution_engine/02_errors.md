# FEAT-006 — Standards Resolution Engine: Error Codes

## 1. Error Sources

All errors in this feature are thrown as native `Error` objects with descriptive messages. The `selector.ts` module throws `NotImplementedError` for its stub functions.

## 2. Error Catalog

| Error | Source Module | Condition | Message Pattern |
|-------|--------------|-----------|-----------------|
| Missing standards index | `registryLoader.ts` | `standards_index.json` not found at expected path | `Standards index not found: {path}` |
| Missing resolver rules | `registryLoader.ts` | `resolver_rules.v1.json` not found at expected path | `Resolver rules not found: {path}` |
| Missing pack file | `registryLoader.ts` | Pack JSON file referenced in index but absent on disk | `Standards pack not found: {path} (pack_id: {id})` |
| Missing snapshot | `snapshot.ts` | `resolved_standards_snapshot.json` not found in run directory | `Standards snapshot not found: {path}` |
| Not implemented | `selector.ts` | Stub functions called before implementation | `NotImplementedError: {functionName}` |

## 3. Error Handling Rules

- All errors are thrown synchronously (no async error paths)
- File-not-found errors include the full expected path for diagnostics
- Pack-not-found errors include the `pack_id` to trace back to the index entry
- No error codes are currently registered in a centralized error registry; errors use descriptive message strings

## 4. Cross-References

- FEAT-017 (Error Taxonomy & Registry) — future integration for structured error codes
- SYS-07 (Compliance & Gate Model)
