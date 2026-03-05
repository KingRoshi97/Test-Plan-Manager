# FEAT-017 — Error Taxonomy & Registry: Contract

## 1. Purpose

Centralized error code registry providing domain-scoped error definitions with severity classification, retryability flags, and normalized error object construction. All Axion subsystems use this registry to produce consistent, structured, actionable error objects.

## 2. Inputs

- **Registry file path** (`string`): Path to a JSON file conforming to the error registry schema (`{ version: string, entries: ErrorCode[] }`)
- **Error events** (`unknown`): Raw errors/exceptions from any subsystem
- **ErrorCode definition** (`ErrorCode`): Looked-up error definition from the registry
- **Context** (`Record<string, unknown>`): Optional key-value pairs providing error-specific context

## 3. Outputs

- **ErrorRegistry**: Loaded, indexed registry with `entries[]`, `by_code{}`, and `by_domain{}` indexes
- **NormalizedError**: Structured error object with `code`, `domain`, `severity`, `message`, `timestamp`, `context`, `retryable`, and `action` fields

## 4. Invariants

- Every error code matches the pattern `ERR-[A-Z][A-Z0-9_]+-\d{3}` (e.g., `ERR-INT-001`, `ERR-GATE-002`)
- Error codes are unique across the entire registry — duplicate codes cause a load-time error
- Severity is one of: `critical`, `error`, `warning`, `info`
- Error normalization is deterministic given the same inputs (except `timestamp`)
- Registry loading validates all entries; malformed entries cause immediate rejection
- Context sanitization strips functions and serializes Error objects to `{ message, name }`
- Unclassified errors (no registry match) produce a fallback `ERR-{DOMAIN}-000` normalized error

## 5. Dependencies

- None (root infrastructure feature)

## 6. Source Modules

- `src/core/taxonomy/errors.ts` — Error code validation, registry loading, lookup, and domain/severity queries
- `src/core/taxonomy/normalize.ts` — Error normalization, message template formatting, context sanitization

## 7. Failure Modes

- `ERR-TAX-001`: Registry file not found at specified path
- `ERR-TAX-002`: Registry file unreadable (permission or I/O error)
- `ERR-TAX-003`: Registry file is not valid JSON
- `ERR-TAX-004`: Registry missing required `version` field
- `ERR-TAX-005`: Registry missing required `entries` array
- `ERR-TAX-006`: Entry missing required `code` field
- `ERR-TAX-007`: Invalid error code format (does not match `ERR-DOMAIN-NNN`)
- `ERR-TAX-008`: Duplicate error code in registry
- `ERR-TAX-009`: Invalid severity value

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- INT-05 (Error Code Catalog) — intake-specific error codes follow similar patterns
- No directly owned gates
