VER-02 — Verification Command Policy (When/How to Run Checks)
(Hardened Draft — Full)
1) Purpose
Define the strict policy for running verification checks and capturing proof, including:
when checks must be run
which checks are mandatory vs conditional
how command output is captured and stored
how failures are handled (stop vs continue)
how verification maps to acceptance items
This prevents “I’ll run tests later” drift and standardizes evidence collection.

2) Inputs
Acceptance Map (PLAN-02): required checks + how_to_verify + proof requirements
Resolved Standards Snapshot (STD-03): mandated checks (build/lint/test/perf)
Proof Types (VER-01)
Work Breakdown (unit boundaries)

3) Outputs
Verification events (command runs) that create:
proof artifacts (VER-01)
acceptance status updates
state snapshot updates

4) Command Policy Invariants (must always be true)
Checks are tied to acceptance: every required verification command must map to an acceptance_id.
Fail-fast on hard gates: failures on hard-gate checks block unit completion.
Capture is mandatory: command, cwd, exit code, and stdout/stderr pointers are required for proof.
No silent retries: retries must be recorded as separate attempts with timestamps.
Deterministic environment: record enough context to reproduce (cwd, environment label).

5) When to Run Verification (Locked Rules)
V2-RUN-01 Per-unit completion (mandatory)
Before marking a unit complete:
run all verification commands associated with that unit’s hard-gate acceptance items
capture proof artifacts
update acceptance status
V2-RUN-02 After foundational units (mandatory)
After setup/security/data/quality foundation units:
run baseline checks required by standards snapshot (build/lint/tests as applicable)
V2-RUN-03 Before packaging completion claim (mandatory)
Before claiming “project complete”:
run full required verification suite specified by standards snapshot and acceptance map
produce final proof references for completion criteria
V2-RUN-04 On changes affecting many units (conditional)
If a change touches core foundations (auth, data model, routing, shared components):
run at least regression checks that cover affected scopes (as defined in QA templates / acceptance map)

6) Verification Command Categories (Locked)
Commands are categorized as:
build
lint
unit_tests
integration_tests
e2e_tests
typecheck
security_checks (if defined)
performance_checks (if defined)
Rule: Each acceptance item that requires commands must specify category and exact command string(s).

7) Command Capture Rules (Proof discipline)
For every command run, record:
command_id (unique)
acceptance_id (required link)
unit_id (required link)
category
command (full string)
cwd
env_label (optional but recommended: dev/stage/prod)
started_at, finished_at
exit_code
stdout_ref (file pointer or bounded inline)
stderr_ref (file pointer or bounded inline)
Bounded inline rule: if inline capture is used, cap length and store full output as a file ref.

8) Failure Handling Policy (Locked)
V2-FAIL-01 Hard-gate failure
If a command tied to a hard-gate acceptance item fails:
mark acceptance status FAIL
mark unit status BLOCKED
record blocker with pointer to acceptance_id and proof refs
unit cannot be completed until resolved and re-verified
V2-FAIL-02 Soft-gate failure
If a soft-gate check fails:
mark acceptance status FAIL
unit may proceed only if policy allows “pass with warnings”
must be recorded in state snapshot warnings
V2-FAIL-03 Flaky checks
If a check is flaky:
retries are allowed but must be recorded as separate proof attempts
a unit cannot be marked complete without a PASS proof for hard-gate checks

9) Mapping Commands to Acceptance Items (Required)
Every verification command must belong to a specific acceptance item.
If a command is “global” (e.g., full test suite), it still must map to:
a completion acceptance item (global), or
a unit-level acceptance item defined for that purpose
No “free-floating commands” without acceptance linkage.

10) Failure Modes
commands run without linking to acceptance_id (un-auditable)
pass/fail claimed without exit code evidence
unit marked complete with failing hard-gates
retries overwrite evidence (should be separate attempts)

11) Definition of Done (VER-02)
VER-02 is complete when:
run timing rules are explicit (per unit, foundations, completion)
command categories are locked
capture contract is explicit and produces VER-01 proof artifacts
failure handling is explicit (hard vs soft gating)
command-to-acceptance linkage is mandatory and enforceable

