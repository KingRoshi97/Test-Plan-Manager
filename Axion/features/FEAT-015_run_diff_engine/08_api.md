# FEAT-015 — Run Diff Engine: API Surface

## 1. Module Exports

- `src/core/diff/runDiff.ts`
- `src/core/diff/classify.ts`

## 2. Public Functions

### `diffRuns(previousRunDir: string, currentRunDir: string): DiffReport`

- **Module**: `src/core/diff/runDiff.ts`
- **Parameters**:
  - `previousRunDir` — Path to the baseline run directory
  - `currentRunDir` — Path to the comparison run directory
- **Returns**: `DiffReport` with entries sorted by path and summary counts
- **Throws**: `ERR-DIFF-001` if directory does not exist, `ERR-DIFF-002` if path is not a directory
- **Side Effects**: Reads files from both directories (no writes)

### `classifyChanges(entries: DiffEntry[]): DiffEntry[]`

- **Module**: `src/core/diff/classify.ts`
- **Parameters**:
  - `entries` — Array of `DiffEntry` objects (typically from `diffRuns()`)
- **Returns**: New array of `DiffEntry` with `classification` field populated
- **Throws**: None
- **Side Effects**: None (pure function)

### `classifySingleChange(entry: DiffEntry): ChangeClassification`

- **Module**: `src/core/diff/classify.ts`
- **Parameters**:
  - `entry` — Single `DiffEntry` object
- **Returns**: `ChangeClassification` — one of `"structural"`, `"content"`, `"metadata"`, `"formatting"`, `"unknown"`
- **Throws**: None
- **Side Effects**: None (pure function)

## 3. Types

### `DiffEntry` (exported from `runDiff.ts`)

```typescript
interface DiffEntry {
  path: string;
  change_type: "added" | "removed" | "modified" | "unchanged";
  previous_hash?: string;
  current_hash?: string;
  classification?: string;
}
```

### `DiffReport` (exported from `runDiff.ts`)

```typescript
interface DiffReport {
  previous_run_id: string;
  current_run_id: string;
  diffed_at: string;
  entries: DiffEntry[];
  summary: { added: number; removed: number; modified: number; unchanged: number };
}
```

### `ChangeClassification` (exported from `classify.ts`)

```typescript
type ChangeClassification = "structural" | "content" | "metadata" | "formatting" | "unknown";
```

## 4. Error Codes

See 02_errors.md for the complete error code table.

## 5. Integration Points

- FEAT-001 (Control Plane Core — run directory structure and manifest format)

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
