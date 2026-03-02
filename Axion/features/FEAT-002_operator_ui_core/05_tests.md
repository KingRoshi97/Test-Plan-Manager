# FEAT-002 — Operator UI Core: Test Plan

  ## 1. Unit Tests

  ### 1.1 Core Function Tests

  - `validateIntake()` — verify correct output for valid input
- `validateIntake()` — verify error handling for invalid input
- `resolveStandards()` — verify correct output for valid input
- `resolveStandards()` — verify error handling for invalid input
- `buildSpec()` — verify correct output for valid input
- `buildSpec()` — verify error handling for invalid input
- `planWork()` — verify correct output for valid input
- `planWork()` — verify error handling for invalid input
- `fillTemplates()` — verify correct output for valid input
- `fillTemplates()` — verify error handling for invalid input
- `packageKit()` — verify correct output for valid input
- `packageKit()` — verify error handling for invalid input
- `runGates()` — verify correct output for valid input
- `runGates()` — verify error handling for invalid input
- `runControlPlane()` — verify correct output for valid input
- `runControlPlane()` — verify error handling for invalid input
- `exportBundle()` — verify correct output for valid input
- `exportBundle()` — verify error handling for invalid input
- `release()` — verify correct output for valid input
- `release()` — verify error handling for invalid input
- `repro()` — verify correct output for valid input
- `repro()` — verify error handling for invalid input
- `generateKit()` — verify correct output for valid input
- `generateKit()` — verify error handling for invalid input

  ### 1.2 Edge Cases

  - Empty input handling
  - Boundary value testing
  - Error propagation verification

  ## 2. Integration Tests

  - End-to-end flow through Operator UI Core pipeline stage
  - Integration with dependent features: FEAT-001
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
  