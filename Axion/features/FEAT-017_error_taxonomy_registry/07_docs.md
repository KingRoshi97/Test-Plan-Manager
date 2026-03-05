# FEAT-017 — Error Taxonomy & Registry: Documentation Requirements

## 1. API Documentation

All exported functions have documented signatures:

### errors.ts exports
- `validateErrorCode(code: string): boolean`
- `extractDomain(code: string): string | null`
- `loadErrorRegistry(registryPath: string): ErrorRegistry`
- `lookupErrorCode(code: string, registry: ErrorRegistry): ErrorCode | undefined`
- `listDomains(registry: ErrorRegistry): string[]`
- `listByDomain(domain: string, registry: ErrorRegistry): ErrorCode[]`
- `listBySeverity(severity: ErrorCode["severity"], registry: ErrorRegistry): ErrorCode[]`
- `compareSeverity(a: ErrorCode["severity"], b: ErrorCode["severity"]): number`
- `createInMemoryRegistry(entries: ErrorCode[], version?: string): ErrorRegistry`

### normalize.ts exports
- `formatErrorMessage(template: string, params: Record<string, unknown>): string`
- `normalizeError(error: unknown, errorDef: ErrorCode, context?: Record<string, unknown>): NormalizedError`
- `normalizeUnknownError(error: unknown, domain?: string, context?: Record<string, unknown>): NormalizedError`
- `isNormalizedError(value: unknown): value is NormalizedError`

## 2. Architecture Documentation

- Two modules: `errors.ts` (registry) and `normalize.ts` (normalization)
- Data flow: Load registry from JSON → lookup error code → normalize error with context → produce NormalizedError
- No external dependencies; consumed by all other features as a foundational utility

## 3. Operator Documentation

- Registry file format: JSON with `version` (string) and `entries` (ErrorCode array)
- Error code format: `ERR-DOMAIN-NNN` where DOMAIN is uppercase alphanumeric, NNN is 3 digits
- Known domains: INT, GATE, STD, TMP, KIT, PLAN, CAN, SCAN, REF, COV, DIFF, REPRO, REL, CACHE, CAS, POL, TAX, SYS

## 4. Change Log

- v1.0.0: Initial implementation — registry loading, validation, lookup, normalization, context sanitization

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
