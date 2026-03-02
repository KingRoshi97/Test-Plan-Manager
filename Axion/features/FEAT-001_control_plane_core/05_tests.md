# FEAT-001 — Control Plane Core: Test Plan

  ## 1. Unit Tests

  ### 1.1 Core Function Tests

  - `initRun()` — verify correct output for valid input
- `initRun()` — verify error handling for invalid input
- `advanceStage()` — verify correct output for valid input
- `advanceStage()` — verify error handling for invalid input
- `getRunState()` — verify correct output for valid input
- `getRunState()` — verify error handling for invalid input
- `pinArtifact()` — verify correct output for valid input
- `pinArtifact()` — verify error handling for invalid input
- `evaluatePolicy()` — verify correct output for valid input
- `evaluatePolicy()` — verify error handling for invalid input
- `createRelease()` — verify correct output for valid input
- `createRelease()` — verify error handling for invalid input
- `queryAuditLog()` — verify correct output for valid input
- `queryAuditLog()` — verify error handling for invalid input

  ### 1.2 Edge Cases

  - Empty input handling
  - Boundary value testing
  - Error propagation verification

  ## 2. Integration Tests

  - End-to-end flow through Control Plane Core pipeline stage
  - Integration with dependent features: none
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
  