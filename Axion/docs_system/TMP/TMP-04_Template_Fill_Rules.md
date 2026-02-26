TMP-04 — Template Fill Rules (Direct/Derived/Standards Inserts; No Guessing)
(Hardened Draft — Full)
1) Purpose
Define how the internal agent fills templates into completed kit documents by:
resolving placeholders from authoritative artifacts
computing derived inserts deterministically
injecting standards constraints from the snapshot
preventing invention/guessing
emitting unknowns as structured UNKNOWN blocks and canonical unknown objects
TMP-04 is the “filler law.” It must be deterministic.

2) Inputs
Template Selection Result (TMP-03)
Template files (TMP-02 contract)
Canonical Spec (CAN-01)
Resolved Standards Snapshot (STD-03)
Work Breakdown (A2.4)
Acceptance Map (A2.5)
Unknowns list (CAN-03; may be appended by filler under strict rules)

3) Outputs
For each selected template:
a filled document at its output_path
a fill report (optional but recommended for audit)
any new canonical unknowns created (strictly controlled)

4) Fill Invariants (must always be true)
Authoritative sources only: fill uses only CAN/STD/PLAN/QA artifacts (no chat memory).
No invention: missing required values become UNKNOWN or gate failure.
Deterministic derived values: derived inserts must be reproducible.
No duplicate truth: filled docs reference canonical IDs; they don’t redefine.
Unknown traceability: any UNKNOWN in a filled doc must map to a canonical unknown object.

5) Placeholder Resolution Rules (Locked)
5.1 Direct Inserts
For placeholder {{path}}:
resolve path against permitted sources (in this precedence order):
Canonical Spec
Standards Snapshot
Work Breakdown
Acceptance Map
Trace IDs (submission_id/spec_id/etc.)
If not found:
if placeholder marked | OPTIONAL → render empty or “N/A”
if placeholder marked | UNKNOWN_ALLOWED → emit UNKNOWN block
else → template fill fails (hard stop)
5.2 Array Inserts
For {{path.to.array[]}}:
render using the output format specified by the template:
list or table format must be deterministic
ordering must be stable:
by canonical ID order, or by Work Breakdown order if relevant
5.3 Derived Inserts
For {{derive:NAME(args)}}:
derived functions must be from an approved catalog (see 6)
derived outputs must be deterministic and traceable

6) Derived Insert Catalog (Approved Functions)
Derived functions exist to compute relationships already present in canonical spec indexes/cross-maps. Examples of allowed functions:
derive:WORKFLOW_TO_FEATURES(workflow_id)
derive:FEATURE_TO_WORKFLOWS(feature_id)
derive:FEATURE_TO_OPERATIONS(feature_id)
derive:ROLE_TO_WORKFLOWS(role_id)
derive:SCREEN_TO_WORKFLOWS(screen_id)
derive:UNIT_SCOPE_SUMMARY(unit_id) (from work breakdown scope_refs)
derive:UNIT_ACCEPTANCE_ITEMS(unit_id) (from acceptance map)
Rules:
Derived functions cannot invent new entities.
Derived functions must operate only on existing canonical indexes/cross-maps.

7) Standards Inserts (Ruleset Injection)
Templates may request standards content in two forms:
7.1 Direct rule inserts
{{standards.rules[rule_id]}} (conceptual; actual path depends on snapshot structure)
7.2 Category summary inserts
Insert a deterministic summary of a standards category:
Engineering constraints summary
Security baseline summary
Design system constraints summary
Rule:
summaries must be derived from the snapshot, not written from memory.

8) Unknown Handling During Fill (Strict)
8.1 When filler may create unknowns
Only when:
a placeholder is marked UNKNOWN_ALLOWED
and the missing value cannot be resolved from authoritative sources
8.2 Unknown creation must produce CAN-03 objects
For every UNKNOWN block inserted into a filled doc, the filler must:
create (or reference) a canonical unknown object:
unknown_type
blocking policy per CAN-03
attachment ref: field_path or entity_id + template_id/section
include the unknown_id in the doc’s unknown block
8.3 Unknown reuse
If an unknown already exists for the same gap:
reuse the existing unknown_id (no duplicates)

9) Fill Report (Recommended Output)
For audit and debugging, each filled doc may have a fill report entry:
template_id + version
inputs used (artifact IDs)
placeholders resolved count
unknowns created/reused count
unresolved placeholders (if any; should be none in successful fills)

10) Failure Modes
placeholders resolve from non-authoritative sources → drift
derived inserts not stable → non-deterministic docs
unknowns inserted without canonical unknown IDs → untraceable gaps
templates rewrite truth instead of referencing IDs → contradictions

11) Definition of Done (TMP-04)
TMP-04 is complete when:
placeholder resolution precedence and missing-value policy are locked
derived insert catalog is defined and restricted
standards injection is defined as snapshot-derived only
unknown insertion creates/reuses canonical unknown objects
fill behavior is deterministic and gateable

