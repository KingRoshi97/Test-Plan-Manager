SYS-06 — Data & Traceability Model (Hardened Draft)
1) Purpose
Define the required provenance chain so every decision and output in Axion can be traced back to:
the user’s raw submission
the validated/normalized inputs
the resolved standards snapshot
the canonical spec
the generated plans, filled docs, and proofs
This is the system’s audit spine.

2) Traceability Chain (locked)
Every project must maintain this linked chain:
Intake Submission Record (raw, immutable)
Validation Result (pass/fail + issues; schema version)
Normalized Input Record (cleaned/standardized + normalization report)
Resolved Standards Snapshot (pinned ruleset + versions + overrides applied/blocked)
Canonical Spec (stable IDs + relationships + unknowns)
Work Breakdown (unit IDs + dependencies + spec mappings)
Acceptance Map (acceptance IDs + proof requirements per unit)
Agent Kit Manifest/Index (IDs → file paths + reading order)
Proof Log (proof IDs linked to acceptance IDs)
State Snapshot (unit progress + acceptance status + proof refs)

3) Required IDs (minimum linkage keys)
Every artifact must include:
submission_id (root of provenance)
schema_version and form_version (for intake-related artifacts)
standards_version (for standards snapshot and downstream artifacts)
template_library_version + template versions used (for filled docs)
spec_id (for spec and downstream artifacts)
work_breakdown_id (for planning and downstream)
acceptance_map_id (for verification and downstream)
kit_id (for packaged output)
state_id (for continuity record)

4) Link Rules (must always be true)
TR-01 No orphan artifacts
No artifact may exist without a pointer to its upstream parent(s). Minimum:
everything must link to submission_id
TR-02 No silent transformations
Normalization and standards resolution must record:
what changed
why it changed
before/after (or hashed previews)
TR-03 Override traceability
Any override must record:
what changed (field_path)
who/what requested it (source)
reason
whether it was allowed
timestamp
TR-04 Proof traceability
Every proof artifact must link to:
an acceptance_id
which links to a unit_id
which links to spec IDs
So proof always ties back to “what requirement did this prove?”

5) Minimal Trace Fields per Artifact Type (summary)
Submission Record: submission_id, timestamp, submitter, form/schema versions, raw payload, upload refs
Validation Result: submission_id, schema_version, is_valid, issues[]
Normalized Input: submission_id, schema_version, normalized_payload, normalization_report
Standards Snapshot: submission_id, standards_version, resolved_ruleset, overrides[]
Canonical Spec: submission_id, spec_id, standards_version, stable ID index
Work Breakdown: spec_id, units[], scope_refs[]
Acceptance Map: work_breakdown_id, acceptance_items[], proof requirements
Kit Manifest: kit_id, spec_id, template versions, IDs→paths
Proof Log: proof_id, acceptance_id, type, location, timestamp
State Snapshot: state_id, unit_status, acceptance_status, proof refs, last_known_good

6) Failure Modes prevented
“we don’t know where this requirement came from”
templates drifting away from canonical spec
proofs that can’t be tied to any acceptance criterion
re-running the pipeline and getting inconsistent outputs without explanation

7) Definition of Done
SYS-06 is complete when:
the traceability chain is explicit and unbroken
required IDs are enumerated and unambiguous
link rules are strict enough to enforce auditability
this model aligns with artifact specs in A1/A2/A5/A6
