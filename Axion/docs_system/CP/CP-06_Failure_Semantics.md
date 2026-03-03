CP-06 — Failure Semantics

1) Purpose
Define the cross-cutting failure handling rules that apply to all three control planes. Every failure must be classified, produce structured output, and include remediation guidance.

2) Failure Classifications

2.1 Contract Failure (`contract_failure`)
A required contract or schema was violated. The system cannot proceed because inputs, outputs, or intermediate artifacts do not conform to their declared contracts.
- Behavior: Fail-fast. Pipeline halts immediately.
- Retryable: No. The contract must be fixed before retry.
- Codes: CF-001 through CF-006 (see FAILURE_CODES_REGISTRY.json)
- Examples: schema violation, missing required artifact, referential integrity break, invalid state transition

2.2 Verification Failure (`verification_failure`)
Verification checks did not pass. The artifacts exist but do not meet quality requirements.
- Behavior: Does not fail-fast. Produces remediation guidance.
- Retryable: Yes, after fixes are applied.
- Codes: VF-001 through VF-008 (see FAILURE_CODES_REGISTRY.json)
- Examples: gate predicate fail, test failure, lint failure, hash mismatch, template completeness fail

2.3 Recoverable Execution Failure (`recoverable_execution_failure`)
An execution-time failure that may be resolved by retry, environment fix, or parameter adjustment.
- Behavior: Does not fail-fast. Allows retry.
- Retryable: Yes, potentially without changes.
- Codes: RE-001 through RE-006 (see FAILURE_CODES_REGISTRY.json)
- Examples: file I/O error, timeout, command execution failure, registry load failure

3) Failure Report Structure
Every failure produces a structured `FailureReport`:
```
{
  classification: FailureClassification,
  stage_id: string,
  gate_id?: string,
  reason_codes: string[],
  evidence: EvidencePointer[],
  remediation: RemediationStep[],
  inputs_consumed: string[],
  outputs_produced: string[],
  timestamp: string
}
```

4) Fail-Fast Rules (F-01 through F-06)

F-01: Minimal Failure Deliverable
Every failed run must produce at minimum:
- The failure report itself
- A state snapshot capturing current stage statuses
- The run log up to the point of failure
- Any artifacts produced before the failure

F-02: Contract Failure Fail-Fast
Contract failures halt the pipeline immediately. No subsequent stages are executed. The run transitions to FAILED state.

F-03: Verification Failure Continuation
Verification failures do not halt the pipeline by default. The stage is marked FAIL, remediation is provided, and the operator may choose to retry or override (if the gate is overridable).

F-04: Rerun Behavior
When a stage is rerun after failure:
- A new attempt_id is generated
- The prior_attempt_ref links to the previous attempt
- The stage report includes all prior attempt references
- Idempotency is enforced: rerunning with identical inputs produces identical outputs

F-05: Override Interaction
Gate overrides interact with failures as follows:
- An override may allow progression past a verification failure
- Overrides have scope (which gates) and expiry (time-limited)
- Never-overridable gates cannot be bypassed under any circumstances
- All overrides are recorded in the audit trail with approver, reason, and expiry

F-06: Cascading Failure Prevention
A failure in one stage does not cascade to corrupt artifacts from previous stages:
- Previous stage artifacts remain valid and immutable
- The state snapshot records last-known-good stage
- Rollback pointer is set to the last successful state

5) Per-Control-Plane Failure Rules

5.1 ICP Failures
- Run transitions to FAILED state on any contract failure
- Gate evaluation failures are recorded but allow override (except never-overridable gates)
- Stage failures are recorded with full failure reports
- Failed runs can be archived (FAILED → ARCHIVED)

5.2 KCP Failures
- Guardrail violations produce BLOCKED state (remediable, not terminal)
- Individual work unit failures do not automatically fail the kit run
- Critical guardrail violations (secrets/PII) are fail-fast
- Verification failures in VERIFYING produce FAILED with remediation

5.3 MCP Failures
- Applying failures trigger ROLLBACKING if a rollback strategy exists
- BLOCKED state is used when compatibility issues are detected (remediable)
- Breaking change detection is fail-fast unless explicitly acknowledged
- Migration failures record partial progress for recovery

6) Remediation
Every failure includes remediation guidance via `RemediationStep`:
```
{
  step_id: string,
  description: string,
  priority: "critical" | "high" | "medium" | "low"
}
```
Remediation steps are ordered by priority. Critical steps must be addressed before retry.
