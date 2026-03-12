# PRD-03 — Personas & Roles

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-03                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring personas & roles    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Personas & Roles Document                         |

## 2. Purpose

Define the canonical user personas and system roles used throughout the kit. Personas
describe user intent; roles describe permissions and access. This doc establishes consistent
naming, privileges, and role-to-feature mapping for downstream design, API authorization, and
testing.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- SPEC_INDEX: {{spec.index}}
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing org notes: {{inputs.org_notes}} | OPTIONAL

## 4. Required Fields

●
●
●
●
●
●
●

Personas list (2–12)
For each persona: name, description, goals, pain points, primary workflows
Roles list (1–20)
For each role: role name, description, permissions summary, scope
Persona ↔ Role mapping (who typically has which role)
Role ↔ Feature access mapping (high level)
Role hierarchy / precedence (if applicable)

Optional Fields
●
●
●
●
●

Persona segments (tiers, plans) | OPTIONAL
Anti-personas / excluded users | OPTIONAL
Role request/approval flow | OPTIONAL
Role lifecycle (invited, active, suspended) | OPTIONAL
Open questions | OPTIONAL

Rules
● Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
● Do not invent features; reference existing IDs from: {{spec.features_by_id}}
● Roles are authorization constructs; personas are research constructs. Do not merge
them.
● Permissions must be described in plain language; implementation details belong in
IAM/ARC docs.
● If a persona or role is uncertain, mark UNKNOWN and list in Open Questions.
● Use consistent terminology from: {{glossary.terms}} | OPTIONAL

Output Format
1) Personas (canonical)
per
son
a_i
d

name

summary

primary_
goals

main_pain_
points

primary_workflows

notes

p1

{{persona {{personas[
s[p1].nam p1].summa
e}}
ry}}

{{persona
s[p1].goal
s}}

{{personas[p {{derive:PERSONA_
1].pain_point TO_WORKFLOWS(p
s}}
1)}}

{{persona
s[p1].note
s}}

p2

{{persona {{personas[
s[p2].nam p2].summa
e}}
ry}}

{{persona
s[p2].goal
s}}

{{personas[p {{derive:PERSONA_
2].pain_point TO_WORKFLOWS(p
s}}
2)}}

{{persona
s[p2].note
s}}

2) Roles (canonical)
rol
e_
id

role_nam
e

description

scope

permissions
_summary

typical_person
as

notes

r_
ad
mi
n

{{roles[r_a
dmin].nam
e}}

{{roles[r_adm
in].descriptio
n}}

{{roles[r_a
dmin].scop
e}}

{{roles[r_admi
n].permission
s}}

{{roles[r_admin]. {{roles[r_a
typical_persona dmin].note
s}}
s}}

r_
us
er

{{roles[r_u
ser].name}
}

{{roles[r_user
].description}}

{{roles[r_u {{roles[r_user]
ser].scope} .permissions}
}
}

{{roles[r_user].ty {{roles[r_u
pical_personas} ser].notes}
}
}

3) Persona ↔ Role Mapping (required)
persona_i
d

typical_role_ids

rationale

p1

{{persona_role_map[p1].role_ids}}

{{persona_role_map[p1].rationale}}

p2

{{persona_role_map[p2].role_ids}}

{{persona_role_map[p2].rationale}}

4) Role Hierarchy / Precedence (required if applicable)
● Higher overrides lower: {{role_hierarchy.order}} | OPTIONAL
● Conflicts resolved by: {{role_hierarchy.conflict_rule}} | OPTIONAL

5) Role ↔ Feature Access (high level)
For each role, list allowed feature IDs and restricted feature IDs.
role
_id

allowed_feature_ids

restricted_feature_ids

notes

r_ad
min

{{role_feature_access[r_ad
min].allowed}}

{{role_feature_access[r_ad
min].restricted}}

{{role_feature_access[r_a
dmin].notes}}

r_us
er

{{role_feature_access[r_us
er].allowed}}

{{role_feature_access[r_use
r].restricted}}

{{role_feature_access[r_u
ser].notes}}

6) Role Lifecycle (optional)
● States: {{role_lifecycle.states}} | OPTIONAL
● How roles are granted: {{role_lifecycle.grant_flow}} | OPTIONAL
● How roles are revoked: {{role_lifecycle.revoke_flow}} | OPTIONAL

7) Open Questions (optional)

● {{open_questions[0]}} | OPTIONAL
● {{open_questions[1]}} | OPTIONAL

Cross-References
● Upstream: {{xref:PRD-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
● Downstream: {{xref:IAM-}} | OPTIONAL, {{xref:ARC-04}} | OPTIONAL, {{xref:SEC-}} |
OPTIONAL, {{xref:QA-02}} | OPTIONAL
● Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Keep permissions_summary high-level; allow UNKNOWN where
inputs are missing.
● intermediate: Required. Add role_feature_access for all roles; minimize UNKNOWN by
deriving from feature list.
● advanced: Not required. (Advanced detail goes into IAM/ARC authorization specs.)

Unknown Handling
● UNKNOWN_ALLOWED: role_hierarchy, role_lifecycle, anti_personas,
segments, open_questions
● If a role has no permissions_summary → block Completeness Gate (no UNKNOWN
exception).

Completeness Gate
● Gate ID: TMP-05.PRIMARY.PROD
● Pass conditions:
○ required_fields_present == true
○ personas_count >= 2
○ roles_count >= 1
○ every_role_has_permissions_summary == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

PRD-04

PRD-04 — Feature Catalog (by ID) +
Acceptance Hooks
Header Block
●
●
●
●
●
●
●
●

## 5. Optional Fields

●
●
●
●
●

Persona segments (tiers, plans) | OPTIONAL
Anti-personas / excluded users | OPTIONAL
Role request/approval flow | OPTIONAL
Role lifecycle (invited, active, suspended) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent features; reference existing IDs from: {{spec.features_by_id}}
- Roles are authorization constructs; personas are research constructs. Do not merge
- **them.**
- Permissions must be described in plain language; implementation details belong in
- **IAM/ARC docs.**
- If a persona or role is uncertain, mark UNKNOWN and list in Open Questions.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## 1) Personas (canonical)`
2. `## per`
3. `## son`
4. `## a_i`
5. `## name`
6. `## summary`
7. `## primary_`
8. `## goals`
9. `## main_pain_`
10. `## points`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- Downstream: {{xref:IAM-}} | OPTIONAL, {{xref:ARC-04}} | OPTIONAL, {{xref:SEC-}} |
- **OPTIONAL, {{xref:QA-02}} | OPTIONAL**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
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
