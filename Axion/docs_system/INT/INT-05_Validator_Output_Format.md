INT-05 — Validator Output Format (Errors/Warnings Contract)
(Hardened Draft — Full)
1) Purpose
Define the single standard output contract for intake validation so:
the pipeline can deterministically branch (pass vs fail)
UI can render field-specific issues consistently
gates can reference exact rule IDs and pointers
downstream stages never need to “interpret” validation results
INT-05 defines the format only. The rules live in INT-03.

2) Inputs
submission_id
schema_version (from INT-04)
INT-02 schema (field paths/types)
INT-03 rules (dependencies/thresholds/reference integrity)
Raw submission payload (INT-04)

3) Outputs
A single Validation Result object:
pass/fail decision
errors (blocking)
warnings (non-blocking, optional)
versions used
This result must be stored and linked to submission_id.

4) Output Contract (Canonical Structure)
4.1 Required top-level fields
submission_id (string)
validated_at (timestamp)
is_valid (boolean)
schema_version_used (string)
form_version_used (string)
ruleset_version_used (string) (INT-03 version or hash; required for determinism)
errors[] (array of ValidationIssue; empty if valid)
warnings[] (array of ValidationIssue; may be empty or omitted if warnings not supported)
summary (object)
error_count
warning_count
blocking_rule_ids[] (unique list)
4.2 ValidationIssue structure
Each issue must include:
issue_id (string, unique)
severity (enum: error | warning)
error_code (enum/string; from error code catalog)
rule_id (string; from INT-03)
field_path (string; schema path)
message (string; user-readable)
meta (object; optional but recommended)
examples:
{ "min_items": 3, "actual": 2 }
{ "allowed_values": ["x","y"], "actual": "z" }
{ "expected_type": "url" }

5) Error Code Catalog (validation-level)
Validator output may only use these codes (locked list):
REQUIRED
DEPENDENCY_MISSING
MIN_ITEMS
INVALID_ENUM
INVALID_ENUM_FOR_CONTEXT
INVALID_FORMAT
INVALID_URL
INVALID_FILETYPE
INVALID_REFERENCE
DUPLICATE_VALUE
WARNING_INCOMPLETE (only if warnings are enabled)
Rule: If a new code is needed, it must be added via change control.

6) Determinism Rules (must always be true)
INT5-DET-01 Stable ordering
Issues should be ordered deterministically:
routing errors
requiredness/dependencies
type/format
reference integrity
thresholds
INT5-DET-02 Stable pointers
field_path must always point to a real schema path.
If the issue is about a relationship (e.g., invalid reference), field_path points to the referencing field.
INT5-DET-03 Rule ID required
Every issue must include rule_id linking it to INT-03.
No “freeform” validator errors without a rule anchor.

7) Pass/Fail Semantics (locked)
is_valid == true only if errors.length == 0
warnings never flip validity (unless you choose a strict policy; default is warnings are non-blocking)

8) Failure Modes
missing rule_id makes remediation impossible
inconsistent field_path breaks UI highlighting
non-deterministic ordering makes debugging difficult
validator uses undefined error codes (breaks automation)

9) Definition of Done (INT-05)
INT-05 is complete when:
validation result format is fully specified
issue structure includes rule_id + field_path + error_code
error code catalog is locked and aligned with INT-03
determinism rules for ordering and pointers are explicit

