TMP-03 — Template Selection Rules (Routing/Gates → Which Templates Apply)
(Hardened Draft — Full)
1) Purpose
Define how the internal agent deterministically selects the exact set of templates to fill for a given project, based on:
routing snapshot (category/type preset/audience/build_target/skill_level)
gate flags (data/auth/integrations enabled)
template requiredness rules
Selection must be reproducible and auditable.

2) Inputs
Template Index (TMP-01)
Resolver context:
routing snapshot (from intake/normalized input)
gate flags: data.enabled, auth.required, integrations.enabled
optional compliance flags (from NFR/compliance)
Template library version (pinned)

3) Outputs
A Template Selection Result used by the Template Filler and Packager:
selection_id
template_library_version_used
resolver_context (routing + gates)
selected_templates[] (ordered list)
omitted_templates[] (with omission reasons)
na_slots[] (where templates are N/A; used by packaging)
created_at

4) Selection Invariants (must always be true)
Deterministic: same context + same template library version ⇒ same selection result.
No ambiguity: a template is either selected or omitted with explicit reason.
Requiredness enforced: templates marked required must be selected when applicable.
No silent omission: if a template type is present in kit layout but no template applies, create 00_NA.md with reason.
No cross-contract conflicts: selection must not require templates that cannot be filled due to missing upstream artifacts.

5) Selection Algorithm (Locked Steps)
Step 1 — Build Selection Context
Create context from canonical sources:
routing: skill_level, category, type_preset, build_target, audience_context
gates: data.enabled, auth.required, integrations.enabled
optional: compliance flags (if used)
Step 2 — Filter Templates by Applies_When
For each template in Template Index:
Evaluate applies_when against context.
Rules:
If template’s applies_when is empty → treat as applies to all.
If requires_data_enabled == true then require data.enabled == true
If requires_data_enabled == false then require data.enabled == false (rare; use only when needed)
Same for auth/integrations.
If routing filters exist, require match within allowed lists.
Step 3 — Apply Requiredness by Skill Level
For each template that passes applies_when:
Determine requiredness for this skill level using:
template entry required_by_skill_level
Interpretation:
required → must select
optional → select if applicable and not excluded by policy
omit → do not select
Step 4 — Enforce Baseline Coverage (Senior Coverage)
Selection must ensure baseline template coverage exists for a project:
Baseline required template types (default):
Product/Requirements
Architecture
Implementation
Security
Quality
Conditional baseline:
Design (if UI/consumer)
Data (if data.enabled)
API Contracts (if service/API build or integrations present)
Ops (if deployable/runtime operations required by preset)
Release/Governance/Analytics only if context triggers them
If baseline cannot be satisfied (no template exists), selection fails (hard stop) because the library is incomplete for that context.
Step 5 — Determine Ordering
Order selected templates deterministically using:
upstream_dependencies graph (topological order)
template type ordering (global stable order list)
template_id lexical tie-breaker
Global type order (locked):
Product/Requirements
Design
Architecture
Data
API/Interface Contracts
Security & Access
Implementation
Quality
Operations
Release
Governance
Analytics
Step 6 — Emit Selection Result
Record:
selected templates
omitted templates with reasons:
not_applicable (fails applies_when)
skill_level_omit
policy_excluded
missing_upstream_dependency (should typically fail instead of omit)
N/A slots required by kit packaging (if no templates selected for slot)

6) Omission Reasons (Locked Enum)
not_applicable
skill_level_omit
policy_excluded
missing_dependency (treated as error by default)

7) Failure Modes
ambiguous applies_when logic creates non-deterministic selection
baseline coverage missing causes “senior gaps”
ordering not consistent causes build drift
selection includes templates whose upstream artifacts are not generated yet

8) Definition of Done (TMP-03)
TMP-03 is complete when:
selection steps are explicit and deterministic
requiredness by skill level is enforced
baseline coverage rules are defined and gateable
selection produces a recorded list of selected + omitted templates with reasons
ordering rules are explicit and stable

