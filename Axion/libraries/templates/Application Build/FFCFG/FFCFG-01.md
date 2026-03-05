# FFCFG-01 — Feature Flag Registry (by flag_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-01                                             |
| Template Type     | Build / Feature Flags                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring feature flag registry (by flag_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Feature Flag Registry (by flag_id) Document                         |

## 2. Purpose

Create the single, canonical registry of all feature flags in the system, indexed by flag_id. This
document must be consistent with the Canonical Spec and must not invent flag_ids not present
in upstream inputs. If flags are missing, they must be marked UNKNOWN rather than invented.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Feature flag index (li... | spec         | Yes             |
| flag_id (stable identi... | spec         | Yes             |
| flag_name (human-reada... | spec         | Yes             |
| flag_description (one ... | spec         | Yes             |
| flag_type (release/ops... | spec         | Yes             |
| owner/team                | spec         | Yes             |
| default_state (on/off)... | spec         | Yes             |
| environments covered (... | spec         | Yes             |
| status (active/depreca... | spec         | Yes             |
| related feature IDs (i... | spec         | Yes             |

## 5. Optional Fields

Created_at / updated_at | OPTIONAL
Expiration / sunset date | OPTIONAL
Notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new flag_ids. Use only: {{spec.flags_by_id[flag_*]}} as given.
Each flag entry MUST be unique by flag_id.
Each flag entry SHOULD have a behavior spec reference ({{xref:FFCFG-02}}) and rollout plan
reference ({{xref:FFCFG-03}}) or be marked UNKNOWN and flagged.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Do not restate full flag behavior here; behavior belongs in FFCFG-02.
Output Format
1. Registry Summary
total_flags: {{ffcfg.registry.total_flags}}
environments: {{ffcfg.registry.envs}} | OPTIONAL
flag_types_in_use: {{ffcfg.registry.flag_types}} | OPTIONAL
notes: {{ffcfg.registry.notes}} | OPTIONAL
2. Flag Index (by flag_id)
For each flag, include the following entry block:
Flag
flag_id: {{flags[0].flag_id}}
flag_name: {{flags[0].flag_name}}
description: {{flags[0].description}}
flag_type: {{flags[0].flag_type}}
owner: {{flags[0].owner}}
default_state: {{flags[0].default_state}}
envs:
dev: {{flags[0].envs.dev}}
stage: {{flags[0].envs.stage}} | OPTIONAL
prod: {{flags[0].envs.prod}}
status: {{flags[0].status}}
related_feature_ids: {{flags[0].related_feature_ids}} | OPTIONAL
behavior_spec_ref: {{flags[0].behavior_spec_ref}} (expected: {{xref:FFCFG-02}}) | OPTIONAL
rollout_plan_ref: {{flags[0].rollout_plan_ref}} (expected: {{xref:FFCFG-03}}) | OPTIONAL
created_at: {{flags[0].created_at}} | OPTIONAL
sunset_date: {{flags[0].sunset_date}} | OPTIONAL
notes: {{flags[0].notes}} | OPTIONAL
open_questions:
{{flags[0].open_questions[0]}} | OPTIONAL
(Repeat the “Flag” entry block for each flag_id.)
3. References
Flag behavior specs: {{xref:FFCFG-02}}

Rollout plans: {{xref:FFCFG-03}} | OPTIONAL
Config matrix: {{xref:FFCFG-04}} | OPTIONAL
Safe degradation rules: {{xref:FFCFG-05}} | OPTIONAL
Audit & change control: {{xref:FFCFG-06}} | OPTIONAL
Cross-References
Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:DOMAIN_MAP}} | OPTIONAL,
{{xref:STANDARDS_INDEX}} | OPTIONAL
Downstream: {{xref:FFCFG-02}}, {{xref:FFCFG-03}}, {{xref:FFCFG-04}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Fill required fields with UNKNOWN where needed; do not invent flag_ids.
intermediate: Required. Populate owner/type/status and behavior/rollout references when inputs
exist.
advanced: Required. Add env-specific defaults and lifecycle details (deprecated/retired) with
traceability.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, stage env, related_feature_ids,
behavior_spec_ref, rollout_plan_ref, created_at, updated_at, sunset_date, notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If flag_id list is UNKNOWN → block Completeness Gate.
If defaults.prod is UNKNOWN for any flag → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FFCFG
Pass conditions:
required_fields_present == true
all flag_ids are unique (no duplicates)
no new flag_ids introduced (only references to existing IDs)
placeholder_resolution == true
no_unapproved_unknowns == true

FFCFG-02

FFCFG-02 — Flag Behavior Spec (default, targeting, kill-switch)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new flag_ids. Use only: {{spec.flags_by_id[flag_*]}} as given.
- Each flag entry MUST be unique by flag_id.
- Each flag entry SHOULD have a behavior spec reference ({{xref:FFCFG-02}}) and rollout plan
- **reference ({{xref:FFCFG-03}}) or be marked UNKNOWN and flagged.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate full flag behavior here; behavior belongs in FFCFG-02.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Flag Index (by flag_id)`
3. `## For each flag, include the following entry block:`
4. `## Flag`
5. `## envs:`
6. `## open_questions:`
7. `## (Repeat the “Flag” entry block for each flag_id.)`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:DOMAIN_MAP}} | OPTIONAL,**
- **{{xref:STANDARDS_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FFCFG-02}}, {{xref:FFCFG-03}}, {{xref:FFCFG-04}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
