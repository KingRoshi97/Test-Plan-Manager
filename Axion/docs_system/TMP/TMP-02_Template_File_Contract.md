TMP-02 — Template File Contract (Required Sections + Placeholder Rules)
(Hardened Draft — Full)
1) Purpose
Define the required structure of every template file so templates are:
predictable for agents to read and fill
machine-navigable (consistent headings, stable section IDs)
gateable (completeness checks are possible)
safe for growth (new templates follow the same contract)
TMP-02 defines template file shape and placeholder conventions. Filling behavior is TMP-04; completeness is TMP-05.

2) Inputs
TMP-01 Template Index entry fields (template_id, type, version, etc.)
Canonical Spec model (CAN-01) and ID rules (CAN-02)
Standards snapshot contract (STD-03)
Skill level rules (INT-03 and template requiredness metadata)

3) Outputs
A standardized template file format used across the entire library.

4) Template File Structure (Locked Order)
Every template file must contain these top-level sections in this exact order:
Header Block (required)
Purpose (required)
Inputs Required (required)
Required Fields (required)
Optional Fields (required)
Rules (required)
Output Format (required)
Cross-References (required)
Skill Level Requiredness Rules (required)
Unknown Handling (required)
Completeness Gate (required)
Rule: Missing any of these sections is a template contract violation.

4.1 Header Block (required fields)
The header must include:
Template ID: (matches Template Index template_id)
Template Type: (matches Template Index type)
Template Version: (matches Template Index template_version)
Applies: (brief; must not contradict Template Index filters)
Filled By: (internal agent)
Consumes: (canonical sources: spec/snapshot/plan/acceptance)
Produces: (filled doc purpose)

5) Placeholder Rules (How variables are written)
5.1 Placeholder Syntax (locked)
All placeholders must follow one of these forms:
Direct insert
{{path.to.value}}
Array insert (list/table)
{{path.to.array[]}}
Derived insert (computed)
{{derive:NAME(args...)}}
Optional placeholder
{{path.to.value | OPTIONAL}}
Unknown-allowed placeholder (explicitly allowed)
{{path.to.value | UNKNOWN_ALLOWED}}
Rule: No other placeholder syntax is allowed.

5.2 Allowed Data Sources (locked)
Placeholders may reference only:
Canonical Spec
{{spec.*}} paths (entities and indexes)
Resolved Standards Snapshot
{{standards.*}} paths (rules, constraints)
Work Breakdown
{{work.*}} paths (units, dependencies)
Acceptance Map
{{acceptance.*}} paths (criteria, proof)
Submission/Trace IDs
{{submission_id}}, {{spec_id}}, {{standards_id}}, etc.
Rule: Templates must never pull from “chat memory” or freeform agent history.

5.3 No Creative Guessing (locked)
If a required placeholder cannot be resolved:
if marked UNKNOWN_ALLOWED → fill with explicit UNKNOWN format (see section 10)
otherwise → the template fails completeness (TMP-05) and blocks progression

6) Required Fields vs Optional Fields (rules)
6.1 Required Fields section
Must enumerate what fields must be populated for this template to be valid, with:
field name
expected source (spec/standards/work/acceptance)
whether UNKNOWN is allowed
6.2 Optional Fields section
Must list optional enrichments, but must not create new truth.

7) Rules Section (template-local invariants)
Must include at minimum:
No duplicate truth rule (reference canonical IDs)
No invention rule (unknown or block)
Any template-specific integrity rules
Rules must be checkable (not subjective).

8) Output Format Section (machine-navigable)
Must define:
required headings (and their order)
required tables/lists formats
any stable subsection identifiers (e.g., “### 2.1 Roles Index”)
Rule: output format must be deterministic.

9) Cross-References Section
Must list:
upstream artifacts it depends on (by ID)
downstream templates that will reference this template
canonical entity types referenced (roles/features/workflows/etc.)

10) Skill Level Requiredness Rules Section
Must define:
which sections become required/optional/omitted by skill level
minimum counts if relevant (e.g., expert requires deeper detail)
Rule: this must align with Template Index required_by_skill_level.

11) Unknown Handling Section (locked format)
Unknowns must be written inside templates in this exact block format:
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>

Rule: Unknowns in templates must also map back to Canonical Spec unknown objects (CAN-03) or be emitted into them during fill (TMP-04 rule).

12) Completeness Gate Section
Every template must end with a checklist that is objectively verifiable and maps to TMP-05 checks, including:
required fields populated
references resolve
no contradictions inside template
unknowns handled per policy

13) Failure Modes
inconsistent placeholder syntax breaks filler
pulling from non-authoritative sources causes drift
optional fields become hidden requirements
unknowns not structured prevents gating and resolution

14) Definition of Done (TMP-02)
TMP-02 is complete when:
required section order is locked
placeholder syntax and allowed sources are locked
unknown block format is locked
the contract is strict enough for automated completeness checks and safe growth
