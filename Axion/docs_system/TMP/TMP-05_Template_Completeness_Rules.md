TMP-05 — Template Completeness Rules (What “Valid” Means)
(Hardened Draft — Full)
1) Purpose
Define the deterministic rules that decide whether a filled template is valid and can be included in the kit as a trusted guidance document.
TMP-05 is the Template Gate: it enforces completeness, integrity, and non-contradiction so downstream agents don’t drift.

2) Inputs
Filled template document (output of TMP-04)
The template definition (TMP-02 contract)
Canonical Spec + Standards Snapshot (for reference checks)
Template Index metadata (required_by_skill_level, applies_when)

3) Outputs
A Template Gate Report (pass/fail) that includes:
template_id + version
output_path
status: pass/fail
issues[] with:
rule_id
pointer (section heading / placeholder key / field_path)
error_code
remediation

4) Validity Invariants (must always be true)
Contract shape: filled doc preserves required section structure and ordering.
Required fields populated: required placeholders are resolved, or allowed UNKNOWN policy is followed.
No invention: no content introduces entities not in canonical spec.
Reference integrity: all referenced IDs resolve to canonical spec entities.
No contradictions: doc does not contradict canonical spec, standards snapshot, or itself.
Skill-level alignment: required_by_skill_level rules are respected.

5) Completeness Rule Sets (Locked)
5.1 Structure Rules
TMP5-STRUCT-01
Rule: All required top-level sections exist and are in the locked order (TMP-02).
Fail code: REQUIRED
Pointer: missing section heading
TMP5-STRUCT-02
Rule: Required subsections defined by template’s Output Format must exist.
Fail code: REQUIRED

5.2 Placeholder Resolution Rules
TMP5-FILL-01
Rule: No unresolved placeholders remain in the filled doc.
Fail code: REQUIRED
Pointer: placeholder token location
TMP5-FILL-02
Rule: Required placeholders must not be empty unless marked OPTIONAL.
Fail code: REQUIRED
TMP5-FILL-03
Rule: UNKNOWN blocks only allowed where placeholders were marked UNKNOWN_ALLOWED and must include unknown_id.
Fail code: INVALID_FORMAT

5.3 Reference Integrity Rules
TMP5-REF-01
Rule: Any referenced entity IDs (role_id, feature_id, workflow_id, etc.) must resolve in canonical spec.
Fail code: INVALID_REFERENCE
TMP5-REF-02
Rule: Any cross-template references must be valid template_ids present in the Template Index.
Fail code: INVALID_REFERENCE

5.4 No Duplicate Truth / No Invention Rules
TMP5-TRUTH-01
Rule: Template must not define new roles/features/workflows/data objects outside canonical spec.
Fail code: INVALID_REFERENCE (or a dedicated code if you add one later)
TMP5-TRUTH-02
Rule: Template must not restate canonical truth in conflicting terms (e.g., feature list differs).
Fail code: INVALID_FORMAT (or dedicated contradiction code later)

5.5 Standards Compliance Rules
TMP5-STD-01
Rule: If template claims a standard (auth method, quality check, etc.), it must match the resolved standards snapshot.
Fail code: INVALID_REFERENCE
Pointer: section making conflicting claim

5.6 Skill-Level Rules (Requiredness + Thresholds)
TMP5-SKILL-01
Rule: Sections marked “required” for the current skill level must be present and complete.
Fail code: REQUIRED
TMP5-SKILL-02
Rule: Minimum counts (if declared by the template) must be met (e.g., expert requires deeper detail).
Fail code: MIN_ITEMS

5.7 Unknown Policy Rules
TMP5-UNK-01
Rule: Any UNKNOWN in a core decision area (as defined by CAN-03 blocking policy) must be marked blocking and must trigger a gate failure if policy forbids it at this stage.
Fail code: DEPENDENCY_MISSING or MIN_ITEMS (depending on what’s missing)
TMP5-UNK-02
Rule: UNKNOWN blocks must be consolidated in the Unknown Handling section and must reference canonical unknown IDs.
Fail code: INVALID_FORMAT

6) Contradiction Checks (minimal deterministic set)
The template gate must fail if:
a list of features in the template does not match canonical feature IDs
a role name/capability differs from canonical spec
an auth requirement contradicts standards snapshot
the template contradicts itself (e.g., “no auth” and “auth required”)

7) Failure Modes
templates pass with unresolved placeholders → external agent guessing
templates include invented scope → drift
unknowns not linked to canonical unknowns → untraceable gaps
skill-level rules ignored → inconsistent depth behavior

8) Definition of Done (TMP-05)
TMP-05 is complete when:
rule sets cover structure, fill, references, truth integrity, standards compliance, skill-level requirements, unknown policy
each rule has deterministic failure codes and pointers
the output gate report format is consistent and usable by the pipeline
