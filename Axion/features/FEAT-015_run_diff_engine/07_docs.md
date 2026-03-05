# FEAT-015 — Run Diff Engine: Documentation Requirements

## 1. API Documentation

- `diffRuns(previousRunDir, currentRunDir)` — JSDoc with parameter types, return type `DiffReport`, and thrown error codes
- `classifyChanges(entries)` — JSDoc with parameter type `DiffEntry[]`, return type `DiffEntry[]`
- `classifySingleChange(entry)` — JSDoc with parameter type `DiffEntry`, return type `ChangeClassification`
- All exported interfaces (`DiffEntry`, `DiffReport`) and types (`ChangeClassification`) documented

## 2. Architecture Documentation

- Module dependency: `classify.ts` imports `DiffEntry` from `runDiff.ts`
- Data flow: caller provides two directory paths → `diffRuns()` hashes all files → produces `DiffReport` → optionally pipe entries through `classifyChanges()`
- No external service dependencies; pure file-system operations

## 3. Operator Documentation

- Usage: `import { diffRuns } from "src/core/diff/runDiff.js"` then `diffRuns(dirA, dirB)`
- Classification: `import { classifyChanges } from "src/core/diff/classify.js"` then `classifyChanges(report.entries)`
- Error codes: `ERR-DIFF-001` (directory not found), `ERR-DIFF-002` (not a directory)

## 4. Change Log

- v1.0.0: Initial implementation — `diffRuns()`, `classifyChanges()`, `classifySingleChange()`

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
