# FEAT-017 — Error Taxonomy & Registry: Contract

  ## 1. Purpose

  Centralized error code registry with domain-scoped error definitions, severity classification, and normalized error object construction.

  ## 2. Inputs

  Error events, error code registry (ERROR_CODE_REGISTRY.json)

  ## 3. Outputs

  Normalized error objects with domain, severity, retryability, and recommended action

  ## 4. Invariants

  - Every error code follows ERR-DOMAIN-NNN format
- Error codes are unique across the registry
- Severity classification is consistent (error, warning, info)
- Error normalization is deterministic

  ## 5. Dependencies

  - None (root feature)

  ## 6. Source Modules

  - `src/core/taxonomy/errors.ts`
- `src/core/taxonomy/normalize.ts`

  ## 7. Failure Modes

  - Duplicate error codes in registry
- Error thrown without registered code (unclassified)
- Severity mismatch between registry and runtime

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - No directly owned gates
  