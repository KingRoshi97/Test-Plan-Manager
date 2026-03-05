# RSC-03 — Prioritization Framework

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RSC-03                                             |
| Template Type     | Product / Roadmap                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring prioritization framework    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Prioritization Framework Document                         |

## 2. Purpose

Define the repeatable method used to prioritize features and scope decisions (e.g.,
RICE/ICE/WSJF/custom). This makes prioritization explainable, consistent, and auditable.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-04: {{xref:PRD-04}}
- URD-03: {{xref:URD-03}} | OPTIONAL
- PRD-02: {{xref:PRD-02}} | OPTIONAL
- RISK-02: {{xref:RISK-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

●
●
●
●
●
●

Selected method name
Score factors (3–8)
Scoring rules (scale definitions)
Weighting (if any)
Tie-break rules
Example scored items (minimum 5 features)

Optional Fields
● Persona/segment weighting | OPTIONAL
● Risk adjustment | OPTIONAL
● Notes | OPTIONAL

Rules
● If scoring features, only use feature IDs from PRD-04.
● The framework must be usable without subjective ambiguity (define scales).
● If weights are used, they must sum to 1.0 or 100.

Output Format
1) Method
● Method name: {{prior.method}}
● Why this method: {{prior.rationale}} | OPTIONAL

2) Factors & Scales (required)
factor_i
d

name

description

scale

weight

f_01

{{factors[0].name}}

{{factors[0].desc}}

{{factors[0].scale}}

{{factors[0].weight}}

f_02

{{factors[1].name}}

{{factors[1].desc}}

{{factors[1].scale}}

{{factors[1].weight}}

3) Tie-break Rules (required)
● {{prior.tie_break[0]}}
● {{prior.tie_break[1]}} | OPTIONAL

4) Scored Features (required, min 5)
feature_id

feature_name

{{spec.features_by_
id[feat_x].id}}

{{spec.features_by_id
[feat_x].name}}

Cross-References

factor_scores

total_score

{{scores[feat_x {{scores[feat
].factors}}
_x].total}}

notes
{{scores[feat_
x].notes}}

● Upstream: {{xref:PRD-04}}, {{xref:URD-03}} | OPTIONAL
● Downstream: {{xref:RSC-01}}, {{xref:IMP-01}} | OPTIONAL
● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Simple method with defined scales.
● intermediate: Required. Add weights and tie-break rules.
● advanced: Not required. (Advanced optimization belongs in planning/analytics.)

Unknown Handling
● UNKNOWN_ALLOWED: weights, persona_weighting, risk_adjustment,
notes
● If scales are undefined → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.SCOPE
● Pass conditions:
○ required_fields_present == true
○ factors_defined == true
○ scales_defined == true
○ scored_items_count >= 5
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

RSC-04

RSC-04 — Change Control Policy (how
scope changes)
Header Block
●
●
●
●
●
●
●
●
●

## 5. Optional Fields

● Persona/segment weighting | OPTIONAL
● Risk adjustment | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If scoring features, only use feature IDs from PRD-04.
- The framework must be usable without subjective ambiguity (define scales).
- If weights are used, they must sum to 1.0 or 100.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Method`
2. `## 2) Factors & Scales (required)`
3. `## factor_i`
4. `## name`
5. `## description`
6. `## scale`
7. `## weight`
8. `## f_01`
9. `## f_02`
10. `## 3) Tie-break Rules (required)`

## 8. Cross-References

- factor_scores
- total_score
- {{scores[feat_x {{scores[feat
- ].factors}}
- _x].total}}
- notes
- {{scores[feat_
- x].notes}}
- Upstream: {{xref:PRD-04}}, {{xref:URD-03}} | OPTIONAL
- Downstream: {{xref:RSC-01}}, {{xref:IMP-01}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
