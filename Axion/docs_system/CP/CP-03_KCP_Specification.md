CP-03 — Kit Control Plane (KCP) Specification

1) Purpose
Define the Kit Control Plane: the kit-local execution controller that manages work unit tracking, verification, proof capture, and guardrail enforcement during kit execution.

2) Inputs
- Kit bundle (produced by ICP): manifest, entrypoint, plan units, verification policy, standards snapshot, rendered templates
- Repository path (target codebase)
- Executor type (internal or external agent)

3) State Model

3.1 Kit Run States
READY → EXECUTING → VERIFYING → COMPLETE
                              → BLOCKED
                              → FAILED
       → PAUSED → RESUMING → EXECUTING
       → CANCELLED

3.2 Work Unit States
NOT_STARTED → IN_PROGRESS → DONE
                           → FAILED
                           → SKIPPED

3.3 Transition Rules
- Kit must be validated before transitioning from READY
- EXECUTING → VERIFYING when all units are DONE/SKIPPED
- VERIFYING → COMPLETE when all verification commands pass
- VERIFYING → BLOCKED when guardrail violations detected
- VERIFYING → FAILED when critical verification failures occur
- PAUSED preserves full unit status index for resumption

4) Runtime Modules

4.1 Kit Validator (`Axion/src/core/kitControlPlane/validator.ts`)
- validateKit(kitDir) → checks required artifacts, schema validity, entrypoint compliance, pinset present
- Produces: kit_validation_report

4.2 Work Unit Manager (`Axion/src/core/kitControlPlane/workUnitManager.ts`)
- loadPlanUnits(kitDir) → parse PLAN_UNIT files
- enforceOneTarget(unit) → reject multi-target units
- recommendNextUnit(unitIndex, completedUnits) → deterministic next unit
- trackUnitStatus(unitId, state, attemptId) → unit_status_index
- Hard rule: each work unit targets exactly 1 artifact

4.3 Verification Runner (`Axion/src/core/kitControlPlane/verificationRunner.ts`)
- runVerificationCommands(policy, repoPath) → execute lint/test/build/typecheck
- captureCommandOutput(commandId, stdout, stderr, exitCode) → structured result
- Produces: verification_run_result, logs/<command_id>.log

4.4 Result Writer (`Axion/src/core/kitControlPlane/resultWriter.ts`)
- writeResult(unitId, implementationRefs, proofRefs) → RESULT_<UNIT_ID>.json
- Enforces: non-empty implementation_refs and proof_refs for DONE status

4.5 Proof Capture (`Axion/src/core/kitControlPlane/proofCapture.ts`)
- captureKitProof(verificationOutput, unitId, target, proofType) → proof_object
- writeKitProofLedger(kitDir, proofObjects) → kit-local proof ledger

4.6 Execution Guardrails (`Axion/src/core/kitControlPlane/guardrails.ts`)
- checkForbiddenPaths(paths, policy) → violations
- checkExternalAgentRestrictions(executorType, action) → violations
- checkPlagiarismReuse(content, allowlist) → violations
- checkSecretsPII(content) → violations
- Produces: guardrail_report

4.7 Kit Run Report (`Axion/src/core/kitControlPlane/kitRunReport.ts`)
- buildKitRunReport(validationResult, units, results, verifications, proofs, guardrails) → kit_run_report

4.8 KCP State Machine (`Axion/src/core/kitControlPlane/stateMachine.ts`)
- canTransitionKitRun(from, to) → validates state transitions
- transitionKitRun(currentState, targetState) → validated transition

5) Output Artifacts
- Kit validation report
- Unit status index (per-unit state tracking)
- Verification run results + command logs
- Result files (RESULT_<UNIT_ID>.json per work unit)
- Kit-local proof ledger
- Guardrail report
- Kit run report (comprehensive summary)

6) Determinism Guarantees
- Unit recommendation order is deterministic given the same unit index and completion state
- Verification commands are executed in the order defined by the verification policy
- Proof capture produces identical proof objects for identical inputs (excluding timestamps)

7) Failure Semantics
- Guardrail violations produce BLOCKED state (not FAILED) — allows remediation
- Verification failures produce FAILED state with remediation guidance
- Individual unit failures do not automatically fail the kit run (other units may continue)
- Critical guardrail violations (secrets/PII detected) are fail-fast

8) Hard Boundaries
- KCP operates only within the kit directory
- KCP cannot modify ICP artifacts or state
- External agents cannot access ICP registries directly
- Each work unit targets exactly 1 artifact (enforced by validator)
- Result files for DONE units must have non-empty implementation_refs and proof_refs
- Proof ledger is append-only
