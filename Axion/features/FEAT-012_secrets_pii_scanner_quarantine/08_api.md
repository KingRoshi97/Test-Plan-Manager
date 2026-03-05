# FEAT-012 — Secrets & PII Scanner / Quarantine: API Surface

## 1. Module Exports

| Module | Path |
|--------|------|
| Scan Packs | `src/core/scanner/packs.ts` |
| Scanner | `src/core/scanner/scan.ts` |
| Quarantine | `src/core/scanner/quarantine.ts` |

## 2. Public Functions

### `loadScanPacks(packsPath: string): ScanPack[]`

- **Module**: `src/core/scanner/packs.ts`
- **Parameters**: `packsPath` — path to a JSON file or directory containing `.json` pack files
- **Returns**: `ScanPack[]` — array of loaded scan pack definitions
- **Throws**: `ERR-SCAN-001` (path not found, read error), `ERR-SCAN-002` (invalid JSON or structure)

### `getDefaultPacks(): ScanPack[]`

- **Module**: `src/core/scanner/packs.ts`
- **Parameters**: none
- **Returns**: `ScanPack[]` — deep copy of built-in `secrets-core` and `pii-core` packs
- **Throws**: never

### `mergePacks(...packSets: ScanPack[][]): ScanPack[]`

- **Module**: `src/core/scanner/packs.ts`
- **Parameters**: `packSets` — variable number of `ScanPack[]` arrays to merge
- **Returns**: `ScanPack[]` — merged packs, deduplicated by `pack_id` and `pattern_id`
- **Throws**: never

### `scanArtifact(filePath: string, packs: ScanPack[]): ScanFinding[]`

- **Module**: `src/core/scanner/scan.ts`
- **Parameters**: `filePath` — path to file to scan; `packs` — loaded scan packs
- **Returns**: `ScanFinding[]` — array of findings with masked snippets
- **Throws**: `ERR-SCAN-003` (file not found or unreadable)
- **Side Effects**: reads file from disk; skips binary/oversized files (returns `[]`)

### `scanDirectory(dirPath: string, packs: ScanPack[]): ScanResult`

- **Module**: `src/core/scanner/scan.ts`
- **Parameters**: `dirPath` — directory to recursively scan; `packs` — loaded scan packs
- **Returns**: `ScanResult` — findings, summary counts, `passed` boolean
- **Throws**: `ERR-SCAN-003` (directory not found)
- **Side Effects**: recursively reads all files; excludes `node_modules`, `.git`, `.quarantine`

### `quarantine(findings: ScanFinding[], runDir: string): QuarantineResult`

- **Module**: `src/core/scanner/quarantine.ts`
- **Parameters**: `findings` — scan findings to process; `runDir` — pipeline run directory
- **Returns**: `QuarantineResult` — new quarantine entries + blocked file paths
- **Throws**: `ERR-SCAN-004` (run directory not found)
- **Side Effects**: creates `.quarantine/` directory, copies flagged files, writes `quarantine_ledger.json`

### `isQuarantined(filePath: string, runDir: string): boolean`

- **Module**: `src/core/scanner/quarantine.ts`
- **Parameters**: `filePath` — file to check; `runDir` — pipeline run directory
- **Returns**: `boolean` — `true` if the file appears in the quarantine ledger
- **Throws**: never (returns `false` if ledger doesn't exist)

### `getQuarantineLedger(runDir: string): QuarantineEntry[]`

- **Module**: `src/core/scanner/quarantine.ts`
- **Parameters**: `runDir` — pipeline run directory
- **Returns**: `QuarantineEntry[]` — full quarantine ledger
- **Throws**: never (returns `[]` if ledger doesn't exist)

## 3. Types

### `ScanPack` (from `packs.ts`)

```typescript
interface ScanPack {
  pack_id: string;
  name: string;
  version: string;
  patterns: ScanPattern[];
}
```

### `ScanPattern` (from `packs.ts`)

```typescript
interface ScanPattern {
  pattern_id: string;
  type: "regex" | "entropy" | "keyword";
  value: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}
```

### `ScanFinding` (from `scan.ts`)

```typescript
interface ScanFinding {
  finding_id: string;
  pattern_id: string;
  pack_id: string;
  file_path: string;
  line?: number;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  snippet?: string;
}
```

### `ScanResult` (from `scan.ts`)

```typescript
interface ScanResult {
  scanned_at: string;
  files_scanned: number;
  findings: ScanFinding[];
  summary: { critical: number; high: number; medium: number; low: number; total: number };
  passed: boolean;
}
```

### `QuarantineEntry` (from `quarantine.ts`)

```typescript
interface QuarantineEntry {
  quarantine_id: string;
  finding_id: string;
  original_path: string;
  quarantine_path: string;
  quarantined_at: string;
  reason: string;
  severity: string;
}
```

### `QuarantineResult` (from `quarantine.ts`)

```typescript
interface QuarantineResult {
  quarantined: QuarantineEntry[];
  blocked_from_kit: string[];
}
```

## 4. Error Codes

See 02_errors.md for the complete error code table (`ERR-SCAN-001` through `ERR-SCAN-004`).

## 5. Integration Points

- FEAT-001 (Control Plane — pipeline invocation)
- FEAT-004 (Artifact Store — scanned content)
- FEAT-009 (Export Bundles — quarantine exclusion)
- FEAT-017 (Error Taxonomy — SCAN domain)

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
