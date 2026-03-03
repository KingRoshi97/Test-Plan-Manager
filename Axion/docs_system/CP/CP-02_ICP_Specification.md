CP-02 — Internal Control Plane (ICP) Specification

1) Purpose
Define the Internal Control Plane: the deterministic orchestrator that manages the full build pipeline from intake through kit packaging.

2) Inputs
- Intake submission (user form data + uploads)
- Registry files (standards, templates, gates, schemas, toolchain, proof types)
- Pin policy (version resolution rules)
- Run context (run_id, mode_id, run_profile_id, risk_class, executor_type_default, targets)

3) State Model

3.1 Run States
QUEUED → RUNNING → GATED → RELEASED → ARCHIVED
                 → FAILED → ARCHIVED
                 → PAUSED → RUNNING (resume)
                 → CANCELLED
                 → ROLLING_BACK → FAILED

3.2 Stage States
NOT_STARTED → IN_PROGRESS → PASS
                           → FAIL
                           → SKIP (with recorded reason)

3.3 Transition Rules
- No stage may be skipped without explicit SKIP + recorded reason
- Stage advancement requires prior stage PASS or SKIP
- GATED state is entered when a gate evaluation point is reached
- RELEASED requires all required stages PASS + all gates PASS
- ARCHIVED is terminal from FAILED or RELEASED
- All transitions are validated by `canTransitionRun()` and `canTransitionStage()`

4) Runtime Modules

4.1 RunController (`Axion/src/core/controlPlane/api.ts`)
- createRun(context) → initializes QUEUED run
- advanceStage(runId, stageId) → validates prior stage, transitions to IN_PROGRESS
- completeStage(runId, stageId, result) → transitions to PASS/FAIL, writes stage report
- gateRun(runId) → RUNNING→GATED
- releaseRun(runId) → validates all stages + gates, transitions to RELEASED
- failRun(runId, reason) → transitions to FAILED with classification
- archiveRun(runId) → FAILED/RELEASED → ARCHIVED

4.2 JSONRunStore (`Axion/src/core/controlPlane/store.ts`)
- createRun, getRun, updateRun, listRuns with JSON file I/O

4.3 RegistryLoader (`Axion/src/core/controlPlane/registryLoader.ts`)
- loadRegistries(paths) → load + validate all registries
- resolvePins(pinPolicy, registries) → deterministic version resolution
- validateRegistryIntegrity(registries) → referential integrity check
- Produces: resolved_pinset, registry_resolution_report

4.4 StandardsEngine (`Axion/src/core/controlPlane/standardsEngine.ts`)
- computeApplicability(runContext, standardsIndex) → applicable standards
- resolveStandards(applicability, packs, precedenceRules) → single snapshot
- Produces: standards_applicability_output, resolved_standards_snapshot

4.5 TemplateDriver (`Axion/src/core/controlPlane/templateDriver.ts`)
- selectTemplates(runContext, snapshot, registry) → deterministic selection
- renderTemplates(selection, spec, snapshot) → render + completeness check
- packageEnvelopes(rendered) → render_envelopes[]
- Produces: template_selection_result, render_envelopes[], template_completeness_report

4.6 GateEngine (`Axion/src/core/controlPlane/gateEngine.ts`)
- evaluateGates(artifacts, evidence, gateSetProfile) → per-gate results
- buildGateReport(results, runContext) → gate_report with remediation
- Enforces: predicate operator registry (no invented operators)

4.7 ProofSystem (`Axion/src/core/controlPlane/proofSystem.ts`)
- captureProof(source, proofType, appliesTo) → proof_object
- appendToLedger(ledgerPath, proofObject) → append-only ledger
- verifyProofPointers(proofObjects) → all pointers resolve

4.8 KitPackager (`Axion/src/core/controlPlane/kitPackager.ts`)
- packageKit(runDir, spec, snapshot, rendered, planUnits, verificationPolicy) → kit bundle
- Produces: kit_manifest, kit_entrypoint, bundle_metadata, bundle_export

4.9 AuditLogger (`Axion/src/core/controlPlane/audit.ts`)
- logOperatorAction(action, runId, details) → audit trail entry
- Enforces: never-overridable gate list, override expiry + scope

4.10 ReleaseManager (`Axion/src/core/controlPlane/releases.ts`)
- createRelease, signRelease, publishRelease, revokeRelease

4.11 PinManager (`Axion/src/core/controlPlane/pins.ts`)
- pinArtifact, unpinArtifact, listPins with JSON file I/O
- resolvePinset(pinPolicy) → deterministic version selection

5) Output Artifacts
- O-01: Run Manifest — full run context, pinset_ref, stage summary, artifact inventory
- O-02: Run Log — append-only chronological trace
- O-03: Stage Report — inputs/outputs/validation/failures/remediation per stage
- O-04: Gate Report — per-gate predicate results + evidence pointers
- O-05: Pinset — frozen registry versions
- O-10: State Snapshot — stage statuses + artifact inventory + rollback pointer

6) Determinism Guarantees
- Same inputs + same pinset → same outputs (excluding allowed noise fields)
- Allowed noise fields: timestamps, run_id, host identifiers
- Run context is normalized (stable ordering, consistent casing, env-dependent fields removed)
- All comparisons use goldenCompare() with noise field isolation
- See CP-05 for cross-cutting determinism rules

7) Failure Semantics
- Three classifications: contract_failure, verification_failure, recoverable_execution_failure
- Contract failures are fail-fast (pipeline halts immediately)
- Verification failures produce remediation guidance and allow retry
- Recoverable failures allow retry with same or modified parameters
- Every failure produces a structured FailureReport
- See CP-06 for cross-cutting failure handling

8) Hard Boundaries
- ICP never executes user code
- ICP never generates implementation artifacts (code, configs)
- ICP never modifies external repositories
- Gate results are immutable once written
- Proof ledger is append-only
- Pinset is frozen at run start
- No invented predicate operators in gate evaluation
