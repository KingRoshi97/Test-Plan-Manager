# FEAT-004 — Artifact Store & Registry: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-ART-NNN` format.

## 2. Domain

`ART`

## 3. Error Codes

| Code | Severity | Message | Retryable | Action |
|------|----------|---------|-----------|--------|
| `ERR-ART-002` | error | Invalid ref format or missing required field | false | Check ref string format (`scheme:value`) and ensure CAS refs have `hash`, file refs have `path`. |
| `ERR-ART-003` | warning | Cannot resolve inline ref to file path | false | Inline refs cannot be resolved to filesystem paths. Use `cas:` or `file:` scheme instead. |

## 4. Error Sources

| Function | Throws | Condition |
|----------|--------|-----------|
| `parseRef()` | `ERR-ART-002` | Ref string missing `:` separator or unrecognized scheme |
| `formatRef()` | `ERR-ART-002` | CAS ref without `hash` or file ref without `path` |
| `resolveRef()` | `ERR-ART-002` | CAS ref without `hash` or file ref without `path` |
| `resolveRef()` | `ERR-ART-003` | Inline scheme passed to `resolveRef()` |
| `garbageCollect()` | — | Errors captured in `GCResult.errors[]` array, not thrown |

## 5. Error Handling Rules

- All errors include the error code prefix for grep-ability
- Filesystem errors during GC are captured in `GCResult.errors[]` and do not halt collection
- `createCAS` operations propagate raw filesystem errors (ENOSPC, EACCES)

## 6. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
