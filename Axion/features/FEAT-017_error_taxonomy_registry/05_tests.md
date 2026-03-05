# FEAT-017 — Error Taxonomy & Registry: Test Plan

## 1. Unit Tests

### 1.1 errors.ts — validateErrorCode

- Returns `true` for valid codes: `ERR-INT-001`, `ERR-GATE-002`, `ERR-TAX-009`
- Returns `false` for invalid codes: `ERR-001`, `INT-001`, `ERR--001`, `ERR-int-001`, `ERR-INT-01`, `ERR-INT-1000`

### 1.2 errors.ts — extractDomain

- Extracts `"INT"` from `ERR-INT-001`
- Extracts `"TAX"` from `ERR-TAX-009`
- Returns `null` for invalid codes

### 1.3 errors.ts — loadErrorRegistry

- Loads a valid registry JSON and returns `ErrorRegistry` with correct `by_code` and `by_domain` indexes
- Throws `ERR-TAX-001` when file does not exist
- Throws `ERR-TAX-003` when file is not valid JSON
- Throws `ERR-TAX-004` when `version` field is missing
- Throws `ERR-TAX-005` when `entries` array is missing
- Throws `ERR-TAX-007` when an entry has an invalid code format
- Throws `ERR-TAX-008` when duplicate error codes exist
- Throws `ERR-TAX-009` when an entry has an invalid severity

### 1.4 errors.ts — lookupErrorCode

- Returns the `ErrorCode` for a known code
- Returns `undefined` for an unknown code

### 1.5 errors.ts — listDomains, listByDomain, listBySeverity

- `listDomains()` returns sorted domain names
- `listByDomain()` returns entries for a known domain, empty array for unknown
- `listBySeverity()` filters entries by severity level

### 1.6 errors.ts — createInMemoryRegistry

- Creates registry from an array of ErrorCode objects
- Throws on duplicate codes

### 1.7 normalize.ts — formatErrorMessage

- Replaces `{{key}}` placeholders with values from params
- Leaves unreplaced placeholders as-is when key is missing
- Handles empty template and empty params

### 1.8 normalize.ts — normalizeError

- Produces a `NormalizedError` with all required fields
- Interpolates `message_template` with context params
- Falls back to raw error message when template is empty
- Sanitizes context: strips functions, reduces Error objects

### 1.9 normalize.ts — normalizeUnknownError

- Produces fallback `ERR-{DOMAIN}-000` code
- Extracts message from Error, string, and object-with-message inputs

### 1.10 normalize.ts — isNormalizedError

- Returns `true` for valid NormalizedError objects
- Returns `false` for null, primitives, and objects missing required fields

## 2. Integration Tests

- Load a test registry file, look up a code, normalize an error, verify the full pipeline produces a valid `NormalizedError`
- Verify `normalizeUnknownError` works for errors not in the registry

## 3. Acceptance Tests

- All invariants from 01_contract.md are verified
- All 9 ERR-TAX error codes are exercised in test scenarios
- No `NotImplementedError` remains in any exported function

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (test registry JSON files)
- Helpers: `test/helpers/`

## 5. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
- 04_gates_and_proofs.md (proof requirements)
