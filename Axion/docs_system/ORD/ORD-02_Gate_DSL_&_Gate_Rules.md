ORD-02 — Gate DSL / Gate Rules (How Compliance Is Checked)
(Hardened Draft — Full)
1) Purpose
Define a minimal, deterministic Gate DSL and rule evaluation model so Axion can express and enforce compliance checks consistently across:
docs (SYS/INT/CAN/STD/TMP/etc.)
artifacts (submission/spec/snapshot/templates/kit)
pipeline stages
ORD-02 does not define every domain’s rules; it defines the language and contract for expressing them.

2) Inputs
SYS-07 gate model (what gate types exist conceptually)
INT-05 validator output contract (issue structure patterns)
TMP-05 template gate expectations (template validity rules)
Artifact IDs and version stamps (SYS-06 traceability)

3) Outputs
A gate rule representation that produces:
deterministic pass/fail results
standardized gate reports (issues with pointers and rule IDs)
support for “no forward progress without compliance”

4) Gate DSL (Minimal Operators, Locked)
4.1 Gate Declaration
Each gate is declared as:
gate_id
target (artifact/doc ID or file path)
mode (hard_stop | warn_only)
rules[] (list of rule expressions)
on_fail (stop | continue_with_warnings)
report_format (must match gate report contract)

4.2 Rule Expression Types (allowed primitives)
A) Existence / Non-empty checks
exists(path)
non_empty(path) (string/array/object has content)
B) Equality / membership
eq(path, value)
in(path, [values...])
C) Count / threshold
count(path) >= N
count(path) == N
count(path) <= N
D) Reference integrity
ref_exists(ref_path, index_path)
(e.g., each role_ref in permissions exists in roles_by_id)
E) Schema validation hook
schema_valid(artifact_id)
(expects INT-05 output exists and is_valid==true)
F) Hash/version pin checks
version_eq(path, value)
hash_eq(path, value) (optional but supported)
G) Composite logic
all([rule1, rule2, ...])
any([rule1, rule2, ...])
not(rule)
Rule: Only these operators are allowed in the minimal DSL.

5) Rule Metadata (required for every rule)
Every rule must include:
rule_id
description
severity (error|warning) (must align to gate mode)
pointer_paths[] (what to point at when failing)
error_code (from allowed error code catalog for that gate category)
expression (one of the DSL expressions above)
remediation (what to change)

6) Evaluation Model (Deterministic)
6.1 Input sources
Rules evaluate only against authoritative artifacts:
submission record
validation result
normalized input
standards snapshot
canonical spec
work breakdown / acceptance map
filled templates
kit manifest/index
state snapshot + proof log
No chat context.
6.2 Ordering
Evaluate rules in deterministic order:
gate-level ordering (rules array order)
inside all/any, preserve listed order
6.3 Result aggregation
gate passes if no severity=error rule fails
warnings are included in report but do not block unless gate mode is hard_stop and policy requires

7) Gate Report Contract (produced by any gate)
A gate report must contain:
gate_id
target
status (pass|fail)
executed_at
issues[]:
issue_id
severity (error|warning)
error_code
rule_id
pointer (field_path / template section / file path)
message
remediation
meta (optional)
Rule: rule_id is mandatory. No freeform failures.

8) Override Hook (policy)
ORD-02 supports overrides only as a record type (evaluation remains strict):
a rule may declare overridable: true|false
if overridable and override record exists, report still includes failure but status may be pass-with-override depending on policy
Default: for documentation and system law, overridable is false.

9) Failure Modes
adding new operators makes evaluation inconsistent
rule lacks pointer_paths so remediation is unclear
rule lacks rule_id so compliance can’t be audited
rules evaluate against non-authoritative sources (drift risk)

10) Definition of Done (ORD-02)
ORD-02 is complete when:
gate declaration contract is defined
minimal DSL operators are locked
rule metadata requirements are explicit
evaluation model is deterministic
gate report contract is explicit and consistent

