# FEAT-002 — Operator UI Core: Contract

  ## 1. Purpose

  CLI and operator interface for interacting with the Axion pipeline, triggering runs, inspecting state, and managing configuration.

  ## 2. Inputs

  User CLI commands, flags, file paths, configuration overrides

  ## 3. Outputs

  Pipeline execution results, formatted console output, status reports

  ## 4. Invariants

  - CLI commands map 1:1 to pipeline operations
- All command output is deterministic for identical inputs
- Error messages include actionable remediation guidance
- Exit codes follow standard conventions (0=success, 1=error)

  ## 5. Dependencies

  - FEAT-001

  ## 6. Source Modules

  - `src/cli/axion.ts`
- `src/cli/index.ts`
- `src/cli/commands/generateKit.ts`
- `src/cli/commands/validateIntake.ts`
- `src/cli/commands/resolveStandards.ts`
- `src/cli/commands/buildSpec.ts`
- `src/cli/commands/planWork.ts`
- `src/cli/commands/fillTemplates.ts`
- `src/cli/commands/packageKit.ts`
- `src/cli/commands/runGates.ts`
- `src/cli/commands/runControlPlane.ts`
- `src/cli/commands/exportBundle.ts`
- `src/cli/commands/release.ts`
- `src/cli/commands/repro.ts`

  ## 7. Failure Modes

  - Command fails silently without error output
- Exit code does not match actual outcome
- Output format changes without versioning

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - No directly owned gates
  