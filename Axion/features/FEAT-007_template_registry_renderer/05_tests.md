# FEAT-007 — Template Registry & Renderer: Test Plan

  ## 1. Unit Tests

  ### 1.1 Core Function Tests

  - `selectTemplates()` — verify correct output for valid input
- `selectTemplates()` — verify error handling for invalid input
- `fillTemplate()` — verify correct output for valid input
- `fillTemplate()` — verify error handling for invalid input
- `checkCompleteness()` — verify correct output for valid input
- `checkCompleteness()` — verify error handling for invalid input

  ### 1.2 Edge Cases

  - Empty input handling
  - Boundary value testing
  - Error propagation verification

  ## 2. Integration Tests

  - End-to-end flow through Template Registry & Renderer pipeline stage
  - Integration with dependent features: FEAT-001, FEAT-003, FEAT-006
  - Artifact persistence and retrieval

  ## 3. Acceptance Tests

  - Feature satisfies all invariants defined in 01_contract.md
  - All gate checks pass for valid artifacts
  - Error codes match ERROR_CODE_REGISTRY definitions

  ## 4. Test Infrastructure

  - Test framework: Vitest
  - Fixtures: `test/fixtures/`
  - Helpers: `test/helpers/`

  ## 5. Cross-References

  - VER-01 (Proof Types & Evidence Rules)
  - VER-03 (Completion Criteria)
  - 01_contract.md (invariants to verify)
  - 04_gates_and_proofs.md (proof requirements)
  