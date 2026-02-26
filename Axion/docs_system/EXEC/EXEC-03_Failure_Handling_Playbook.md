EXEC-03 — Failure Handling Playbook (What to Do When Blocked)
(Hardened Draft — Full)
1) Purpose
Define the standard failure-handling procedure for both internal and external agents so blockers are handled deterministically, recorded properly, and do not produce drift through improvisation.
This playbook defines:
failure categories
required response steps
what to record (state/proof/gate report)
when to stop vs continue
how to request missing input

2) Inputs
Gate model + DSL (SYS-07, ORD-02)
Validation output contract (INT-05)
Unknowns model (CAN-03)
Proof rules (VER-01/02/03)
State snapshot contract (STATE-01)

3) Outputs
Blocker entries (STATE-01 blockers[])
Gate reports (for internal agent stage failures)
Proof of failure where applicable (command outputs, logs)
A deterministic “what is needed” request

4) Failure Handling Invariants (must always be true)
No improvisation: when blocked, do not guess; record blocker and stop that scope.
Record before stop: every failure must produce an artifact update (gate report or state blocker).
Pointer precision: every failure must include pointers (unit_id/acceptance_id/field_path/file_path).
Actionable remediation: failures must state exactly what’s needed to proceed.
No silent continuation: continuing with warnings is allowed only where policy explicitly permits.

5) Failure Categories (Locked)
F-01 Intake Validation Failure (internal agent)
Examples: missing required fields, dependency violations, thresholds not met.
F-02 Standards Resolution Failure (internal agent)
Examples: unresolved conflicts, blocked override attempts that are required.
F-03 Spec Integrity Failure (internal agent)
Examples: broken references, duplicate truth, blocking unknowns violate stage policy.
F-04 Template Fill/Completeness Failure (internal agent)
Examples: unresolved placeholders, invented content, contradictions with standards/spec.
F-05 Packaging Failure (internal agent)
Examples: missing required files, manifest/index mismatch, silent omission of slots.
F-06 Verification Failure (external agent)
Examples: tests fail, build fails, lint fails, acceptance hard gate fails.
F-07 Missing Information / Ambiguity (either agent)
Examples: unresolved decisions required for progress; contradictions; missing constraints.
F-08 Environment/Tooling Failure (external agent)
Examples: dependency install fails; environment mismatch; command not available.

6) Required Response Steps (By Category)
6.1 Internal Agent Failures (F-01..F-05)
Step A — Stop progression
Do not produce downstream artifacts beyond failure point.
Step B — Emit Gate Report
gate_id
target artifact
status fail
issues[] with rule_id, pointers, remediation
Step C — If fixable by user input
output a precise request:
which field paths missing
what constraints to satisfy
minimum required content
Step D — Preserve traceability
record that run stopped at stage X with submission_id and versions.
6.2 External Agent Failures (F-06..F-08)
Step A — Record blocker
In 06_state_snapshot.json blockers[]:
blocker_id
unit_id
acceptance_id (if applicable)
description
severity
needs (exact next input/action)
Step B — Capture failure proof
command output proof (exit code + stderr/stdout ref)
log excerpt proof if relevant
Step C — Mark acceptance status FAIL
update acceptance_status entry
link proof_id(s)
Step D — Set unit status BLOCKED
unit_status.status = blocked
current_unit_id stays or moves per resume rules

7) “What is Needed” Request Format (Locked)
When requesting help (from user or maintainer), the agent must output:
context: submission_id/spec_id/unit_id
failure category (F-0X)
exact rule_id(s) failing
pointers (field_path/template section/file_path)
minimal required input to proceed (bullet list)
what was attempted (if external; commands run + exit codes)
proof_ids for failure evidence
No vague “it didn’t work” reports.

8) Continue-With-Warnings Policy (Strict)
Allowed only if:
acceptance item is soft_gate
policy permits “pass with warnings”
warnings are recorded in state snapshot and completion report
Hard gates never allow “continue as done.”

9) Failure Modes Prevented
agent guessing to “push through”
losing context between sessions
untraceable failures
repeated failures without recorded evidence
marking done despite failed checks

10) Definition of Done (EXEC-03)
EXEC-03 is complete when:
failure categories are locked
required response steps are explicit for internal vs external failures
blocker + proof capture requirements align with STATE and VER
request format is precise and pointer-based
warning continuation policy is strict and enforceable

