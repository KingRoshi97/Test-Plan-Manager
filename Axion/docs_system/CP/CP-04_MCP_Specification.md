CP-04 — Maintenance Control Plane (MCP) Specification

1) Purpose
Define the Maintenance Control Plane: the post-delivery maintenance orchestrator that manages dependency upgrades, migrations, test hardening, refactoring, CI maintenance, and Axion compatibility.

2) Inputs
- Maintenance intent (intent_type, scope_constraints, risk_class)
- Repository path (target codebase)
- Existing Axion artifacts (for compatibility checking)
- Dependency manifests (package.json, lockfiles, etc.)
- CI workflow definitions

3) State Model

3.1 Maintenance Run States
PLANNED → APPLYING → VERIFYING → COMPLETE
                               → BLOCKED
                               → FAILED
                  → ROLLBACKING → FAILED
        → PAUSED → APPLYING (resume)
        → CANCELLED

3.2 Transition Rules
- PLANNED requires a valid MaintenanceIntent with ScopeConstraints
- APPLYING → VERIFYING when all maintenance modules complete
- VERIFYING → COMPLETE when all verification checks pass
- VERIFYING → BLOCKED when compatibility issues detected
- APPLYING → ROLLBACKING when a critical failure occurs
- ROLLBACKING → FAILED when rollback completes (run is terminal)
- Rollback strategy must be recorded before entering APPLYING

4) Runtime Modules

4.1 Dependency Manager (`Axion/src/core/maintenanceControlPlane/dependencyManager.ts`)
- applyVersionBumps(manifests, policy) → version bumps per policy (patch/minor/major rules)
- updateLockfiles(repoPath) → deterministic lockfile update
- detectBreakingChanges(before, after) → breaking change notes
- Produces: dependency_update_report, updated lockfiles, changelog entry

4.2 Migration Manager (`Axion/src/core/maintenanceControlPlane/migrationManager.ts`)
- generateMigrationPlan(history, target) → ordered migration steps
- applyMigrations(plan, repoPath) → execute migrations
- checkBackcompat(migration) → backcompat assessment
- Produces: migration_plan, migration_verification_report
- Enforces: migration safety rules, rollback strategy recorded

4.3 Test Maintainer (`Axion/src/core/maintenanceControlPlane/testMaintainer.ts`)
- addRegressionTests(failures) → new tests linked to failure causes
- triageFlakes(testResults) → flake analysis and fixes
- assessCoverage(suite, targets) → coverage report
- Produces: test_update_report

4.4 Refactor Manager (`Axion/src/core/maintenanceControlPlane/refactorManager.ts`)
- planRefactor(scope, constraints) → refactor plan with impact assessment
- applyRefactor(plan, repoPath) → execute controlled changes
- Produces: refactor_report
- Enforces: contract preservation, change-impact notes

4.5 CI Maintainer (`Axion/src/core/maintenanceControlPlane/ciMaintainer.ts`)
- updateWorkflows(workflows, policy) → CI changes
- validateDoctorVerify(workflows) → ensure verification checks preserved
- Produces: ci_update_report

4.6 Axion Compat (`Axion/src/core/maintenanceControlPlane/axionCompat.ts`)
- validateAxionArtifacts(repoPath, schemas) → compatibility check
- checkKitOutputValidity(kitOutputs) → kit still valid after changes
- Produces: axion_compatibility_report

4.7 Maintenance Runner (`Axion/src/core/maintenanceControlPlane/maintenanceRunner.ts`)
- interpretMaintenanceMode(modeId) → maintenance actions to execute
- executeMaintenanceRun(intent, repoPath, policy) → orchestrate modules
- Produces: maintenance_run_report

4.8 MCP State Machine (`Axion/src/core/maintenanceControlPlane/stateMachine.ts`)
- canTransitionMaintenanceRun(from, to) → validates state transitions
- transitionMaintenanceRun(currentState, targetState) → validated transition

5) Output Artifacts
- O-01: Maintenance run report — intent, modules executed, state transitions, change summary
- O-02: Dependency update report — version deltas, breaking changes, changelog
- O-03: Migration plan — ordered steps, backcompat assessment, rollback strategy
- O-04: Migration verification report — execution results per step
- O-05: Test update report — new tests added, flakes triaged, coverage delta
- O-06: Refactor report — impact assessment, changes applied, contract preservation status
- O-07: CI update report — workflow changes, verification checks preserved
- O-08: Axion compatibility report — schema compliance, kit validity
- O-09: Verification summary — all verification commands and results
- O-10: Remediation report — what failed, why, next steps, evidence

6) Determinism Guarantees
- Dependency resolution follows deterministic policy rules (patch/minor/major)
- Migration plans are ordered deterministically
- Refactor plans produce the same output for the same scope and constraints
- All module outputs are reproducible given the same inputs and repo state

7) Failure Semantics
- BLOCKED vs FAILED distinction: BLOCKED allows remediation, FAILED is terminal
- Applying failures trigger ROLLBACKING if rollback strategy exists
- Verification failures during VERIFYING produce BLOCKED with remediation
- Breaking change detection is fail-fast unless explicitly acknowledged
- Every failure includes structured remediation guidance

8) Hard Boundaries
- MCP cannot trigger ICP runs
- MCP cannot modify kit outputs directly
- All changes must be scoped by ScopeConstraints
- Rollback strategy must be recorded before applying changes
- Contract preservation is mandatory for refactors
- CI changes must preserve existing verification checks
- Breaking changes require explicit acknowledgment
