VER-01 — Proof Types & Evidence Rules (What Counts as Proof)
(Hardened Draft — Full)
1) Purpose
Define what qualifies as proof in Axion so completion is based on evidence, not statements. This establishes the proof taxonomy, evidence requirements, and disallowed evidence.
This doc governs:
what proof types exist
what minimum metadata must be recorded
what is acceptable vs unacceptable proof
how proof links to acceptance criteria and work units

2) Inputs
Acceptance Map contract (PLAN-02) for proof requirements per acceptance item
Traceability model (SYS-06) for linking proof → acceptance → unit → spec
Gate model (SYS-07) for completion gating

3) Outputs
A locked proof taxonomy and evidence rules used by:
Proof Log
Completion Gate (VER-03)
Any verification automation

4) Proof Invariants (must always be true)
Proof is linked: every proof must link to an acceptance_id and unit_id.
Proof is reproducible: proof must include enough context to rerun or re-check.
Proof is bounded: large outputs must be referenced by stored file pointer, not pasted endlessly.
Proof is auditable: proof must include timestamp and source context (command, file, screenshot, etc.).
Proof is not narrative: “I tested it” is never proof.

5) Proof Types (Locked Set)
P-01 Command Output Proof
Evidence from running a command (build, lint, tests, scripts).
Required fields:
command string
working directory
exit code
timestamp
stdout/stderr (or file refs)
P-02 Test Result Proof
Evidence from a test runner result (unit/integration/e2e).
Required fields:
test command / runner
pass/fail summary
report location (file ref)
timestamp
P-03 Screenshot / UI Capture Proof
Evidence showing UI state or behavior.
Required fields:
screenshot file ref
what is being proven (brief)
timestamp
context (screen name, flow step)
P-04 Log Excerpt Proof
Evidence from application logs.
Required fields:
log source (file/system)
excerpt pointer or file ref
timestamp
correlation (what acceptance it supports)
P-05 Diff/Commit Reference Proof
Evidence of changes via diff/commit identifiers (when relevant).
Required fields:
diff/commit reference
files changed list (or pointer)
timestamp
what it proves (tie to acceptance)
P-06 Checklist Proof (Manual Verification)
Evidence from a structured checklist with pass/fail items.
Required fields:
checklist ID or name
itemized results
reviewer identity (agent or human)
timestamp
Rule: Manual checklist proof is allowed but should be minimized for core build correctness.

6) Proof Record Contract (Minimum Metadata)
Every proof entry must contain:
proof_id (stable)
acceptance_id
unit_id
proof_type (P-01..P-06)
location (file path or storage ref)
summary (one sentence)
created_at (timestamp)
source_context (object, depends on proof type)
command context, screenshot context, etc.

7) Evidence Quality Rules (What makes proof valid)
7.1 Must be directly relevant
Proof must support the exact acceptance statement, not a loosely related claim.
7.2 Must be current
Proof must be generated for the current build context/version. If the system version or relevant artifacts changed, old proof may be invalid.
7.3 Must show pass/fail objectively
commands must include exit code
tests must include pass/fail summary
screenshots must correspond to the stated screen/state
7.4 Must be accessible
Proof location must be reachable from the kit/workspace environment; broken refs invalidate proof.

8) Disallowed “Proof” (Explicitly not acceptable)
These do not count as proof:
narrative statements (“works now”, “should be fine”)
inferred reasoning (“it must pass because…”)
partial command output with no exit code
screenshots with no context (what it shows/why it matters)
references to chat logs as evidence

9) Failure Modes
proofs not linked to acceptance_id (un-auditable)
proofs stored only in chat (lost, non-deterministic)
outputs too large to parse (need file refs)
manual proofs replacing objective checks for core items

10) Definition of Done (VER-01)
VER-01 is complete when:
proof types are locked and non-overlapping
minimum proof record metadata is defined
validity rules and disallowed evidence are explicit
linkage requirements align with PLAN-02 and SYS-06

