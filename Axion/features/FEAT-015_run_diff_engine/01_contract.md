# FEAT-015 — Run Diff Engine: Contract

## 1. Purpose

Compares two pipeline run directories by SHA-256 hashing every file, producing a deterministic `DiffReport` with per-file change classification. Supports downstream consumers such as incremental planners, release notes generators, and operator dashboards.

## 2. Inputs

| Parameter | Type | Description |
|-----------|------|-------------|
| `previousRunDir` | `string` | Absolute or relative path to the baseline run directory |
| `currentRunDir` | `string` | Absolute or relative path to the comparison run directory |

For classification:

| Parameter | Type | Description |
|-----------|------|-------------|
| `entries` | `DiffEntry[]` | Array of diff entries to classify |

## 3. Outputs

### DiffReport

```typescript
{
  previous_run_id: string;
  current_run_id: string;
  diffed_at: string;          // ISO-8601 timestamp
  entries: DiffEntry[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}
```

### DiffEntry

```typescript
{
  path: string;                // Relative path within run directory
  change_type: "added" | "removed" | "modified" | "unchanged";
  previous_hash?: string;      // SHA-256 hex (present for removed/modified/unchanged)
  current_hash?: string;       // SHA-256 hex (present for added/modified/unchanged)
  classification?: string;     // Set by classifyChanges()
}
```

## 4. Invariants

- Diff is deterministic: identical directory pairs always produce identical entries (sorted by path)
- Every file in both directories appears exactly once in `entries`
- `summary` counts are always consistent with the `entries` array
- SHA-256 hashes are computed from raw file bytes
- Run IDs are extracted from `manifest.json` if present, otherwise derived from directory name
- Empty directories produce an empty entries array with all-zero summary
- `diffed_at` is always a valid ISO-8601 timestamp

## 5. Dependencies

- FEAT-001 (Control Plane Core — run directory structure)

## 6. Source Modules

- `src/core/diff/runDiff.ts` — `diffRuns()`, `DiffEntry`, `DiffReport`
- `src/core/diff/classify.ts` — `classifyChanges()`, `classifySingleChange()`, `ChangeClassification`

## 7. Failure Modes

| Condition | Error | Behavior |
|-----------|-------|----------|
| Run directory does not exist | `ERR-DIFF-001` | Throws immediately |
| Path is not a directory | `ERR-DIFF-002` | Throws immediately |
| File unreadable during hash | Node `EACCES`/`EPERM` | Propagates native error |

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- FEAT-001 (Control Plane Core — run state and directory layout)
