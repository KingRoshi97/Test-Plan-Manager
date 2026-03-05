# FEAT-017 — Error Taxonomy & Registry: API Surface

## 1. Module Exports

Source modules:

- `src/core/taxonomy/errors.ts`
- `src/core/taxonomy/normalize.ts`

## 2. Public Functions

### `validateErrorCode(code: string): boolean`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: `true` if the code matches `ERR-[A-Z][A-Z0-9_]+-\d{3}`, `false` otherwise
- **Side Effects**: None (pure function)

### `extractDomain(code: string): string | null`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: The domain segment from a valid error code (e.g., `"INT"` from `"ERR-INT-001"`), or `null` for invalid codes
- **Side Effects**: None (pure function)

### `loadErrorRegistry(registryPath: string): ErrorRegistry`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: `ErrorRegistry` with `version`, `entries[]`, `by_code{}`, `by_domain{}` indexes
- **Throws**: `ERR-TAX-001` through `ERR-TAX-009` on validation failures
- **Side Effects**: Reads from filesystem

### `lookupErrorCode(code: string, registry: ErrorRegistry): ErrorCode | undefined`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: The `ErrorCode` entry if found, `undefined` otherwise
- **Side Effects**: None (pure lookup)

### `listDomains(registry: ErrorRegistry): string[]`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: Sorted array of domain strings present in the registry
- **Side Effects**: None

### `listByDomain(domain: string, registry: ErrorRegistry): ErrorCode[]`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: Array of `ErrorCode` entries for the given domain, or empty array
- **Side Effects**: None

### `listBySeverity(severity: ErrorCode["severity"], registry: ErrorRegistry): ErrorCode[]`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: Array of `ErrorCode` entries matching the severity level
- **Side Effects**: None

### `compareSeverity(a: ErrorCode["severity"], b: ErrorCode["severity"]): number`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: Negative if `a` is more severe, positive if `b` is more severe, `0` if equal. Order: critical < error < warning < info
- **Side Effects**: None (pure function)

### `createInMemoryRegistry(entries: ErrorCode[], version?: string): ErrorRegistry`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: `ErrorRegistry` built from the provided entries array
- **Throws**: `ERR-TAX-008` on duplicate codes
- **Side Effects**: None

### `formatErrorMessage(template: string, params: Record<string, unknown>): string`

- **Module**: `src/core/taxonomy/normalize.ts`
- **Returns**: Template string with `{{key}}` placeholders replaced by param values
- **Side Effects**: None (pure function)

### `normalizeError(error: unknown, errorDef: ErrorCode, context?: Record<string, unknown>): NormalizedError`

- **Module**: `src/core/taxonomy/normalize.ts`
- **Returns**: `NormalizedError` with code, domain, severity, formatted message, timestamp, sanitized context, retryable flag, and action
- **Side Effects**: Reads system clock for timestamp

### `normalizeUnknownError(error: unknown, domain?: string, context?: Record<string, unknown>): NormalizedError`

- **Module**: `src/core/taxonomy/normalize.ts`
- **Returns**: Fallback `NormalizedError` with code `ERR-{domain}-000` for unclassified errors
- **Side Effects**: Reads system clock for timestamp

### `isNormalizedError(value: unknown): value is NormalizedError`

- **Module**: `src/core/taxonomy/normalize.ts`
- **Returns**: `true` if value has all required NormalizedError fields with correct types
- **Side Effects**: None (type guard)

## 3. Types

### ErrorCode (from errors.ts)
```typescript
interface ErrorCode {
  code: string;
  domain: string;
  severity: "critical" | "error" | "warning" | "info";
  retryable: boolean;
  message_template: string;
  action: string;
  docs_ref?: string;
}
```

### ErrorRegistry (from errors.ts)
```typescript
interface ErrorRegistry {
  version: string;
  entries: ErrorCode[];
  by_code: Record<string, ErrorCode>;
  by_domain: Record<string, ErrorCode[]>;
}
```

### NormalizedError (from normalize.ts)
```typescript
interface NormalizedError {
  code: string;
  domain: string;
  severity: string;
  message: string;
  timestamp: string;
  context: Record<string, unknown>;
  retryable: boolean;
  action: string;
}
```

### ErrorDomain (from errors.ts)
```typescript
type ErrorDomain = "INT" | "GATE" | "STD" | "TMP" | "KIT" | "PLAN" | "CAN" | "SCAN" | "REF" | "COV" | "DIFF" | "REPRO" | "REL" | "CACHE" | "CAS" | "POL" | "TAX" | "SYS";
```

## 4. Error Codes

See 02_errors.md for the complete error code table (ERR-TAX-001 through ERR-TAX-009).

## 5. Integration Points

- Consumed by all other features for error normalization
- Used by FEAT-003 (Gate Engine Core) for gate report error codes
- Used by FEAT-008 (Proof Ledger) for proof log error entries

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
