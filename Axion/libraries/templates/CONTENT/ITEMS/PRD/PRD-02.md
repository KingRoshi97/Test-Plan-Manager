# PRD-02 — Goals, Non-Goals, Success

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-02                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring goals, non-goals, success    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Goals, Non-Goals, Success Document                         |

## 2. Purpose

Lock the product’s intended outcomes and boundaries: what success looks like, what is
explicitly not being attempted, and the measurable signals that indicate progress. This prevents
scope creep and makes later planning, testing, and release gates objective.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- SPEC_INDEX: {{spec.index}}
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing KPI notes: {{inputs.kpi_notes}} | OPTIONAL
- Existing roadmap/milestones: {{inputs.roadmap}} | OPTIONAL

## 4. Required Fields

●
●
●
●
●
●
●

Goals (3–10)
Non-Goals (3–15)
Success metrics (3–12)
Metric definitions (name, description, formula/logic, target)
Measurement cadence
Ownership (who tracks each metric)
Time horizon (MVP / 30-60-90 / release)

Optional Fields
●
●
●
●
●
●

Guardrail metrics | OPTIONAL
Baseline values (current) | OPTIONAL
Leading vs lagging classification | OPTIONAL
Segment definitions (per persona / tier) | OPTIONAL
Data source notes | OPTIONAL
Open questions | OPTIONAL

Rules
●
●
●
●

Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Goals must be outcome-oriented; features do not qualify as goals.
Non-goals must be explicit and testable (what will not be built / supported).
Metrics must be measurable; if not measurable, mark UNKNOWN and create an
instrumentation question.
● If a metric depends on analytics events, reference: {{xref:SMIP-02}} | OPTIONAL
● Do not invent baselines/targets; if missing, mark UNKNOWN (unless standards
disallow).
● If a goal has no metric mapping, it fails the Completeness Gate.

Output Format
1) Goals
List outcomes the product must achieve.
goal_i
d

goal_statement

primary_user_type

mapped_feature_id
s

notes

goal_
01

{{goals[0].statemen {{goals[0].primary_use
t}}
r}}

{{goals[0].feature_id
s}}

{{goals[0].notes
}}

goal_
02

{{goals[1].statemen {{goals[1].primary_use
t}}
r}}

{{goals[1].feature_id
s}}

{{goals[1].notes
}}

goal_
03

{{goals[2].statemen {{goals[2].primary_use
t}}
r}}

{{goals[2].feature_id
s}}

{{goals[2].notes
}}

2) Non-Goals
List explicit exclusions to prevent scope creep.

non_goal
_id

non_goal_statement

rationale

revisit_trigger

ng_01

{{non_goals[0].stateme
nt}}

{{non_goals[0].rational
e}}

{{non_goals[0].revisit_trigge
r}}

ng_02

{{non_goals[1].stateme
nt}}

{{non_goals[1].rational
e}}

{{non_goals[1].revisit_trigge
r}}

ng_03

{{non_goals[2].stateme
nt}}

{{non_goals[2].rational
e}}

{{non_goals[2].revisit_trigge
r}}

3) Success Metrics (Core)
me
tri
c_i
d

metric_
name

type
(leadin
g/laggi
ng)

definition

formula/
logic

target

time_horiz
on

cadence

owner

me
t_0
1

{{metric
s[0].na
me}}

{{metric {{metrics[
s[0].typ 0].definiti
e}}
on}}

{{metrics
[0].formu
la}}

{{metric
s[0].targ
et}}

{{metrics[0]
.time_horiz
on}}

{{metrics
[0].caden
ce}}

{{metric
s[0].own
er}}

me
t_0
2

{{metric
s[1].na
me}}

{{metric {{metrics[
s[1].typ 1].definiti
e}}
on}}

{{metrics
[1].formu
la}}

{{metric
s[1].targ
et}}

{{metrics[1]
.time_horiz
on}}

{{metrics
[1].caden
ce}}

{{metric
s[1].own
er}}

me
t_0
3

{{metric
s[2].na
me}}

{{metric {{metrics[
s[2].typ 2].definiti
e}}
on}}

{{metrics
[2].formu
la}}

{{metric
s[2].targ
et}}

{{metrics[2]
.time_horiz
on}}

{{metrics
[2].caden
ce}}

{{metric
s[2].own
er}}

4) Goal → Metric Mapping (Required)
Every goal must map to at least one metric.
goal_i
d

mapped_metric_ids

pass_condition

goal_0
1

{{goal_metric_map[goal_01].metric_ids {{goal_metric_map[goal_01].pass_conditio
}}
n}}

goal_0
2

{{goal_metric_map[goal_02].metric_ids {{goal_metric_map[goal_02].pass_conditio
}}
n}}

goal_0
3

{{goal_metric_map[goal_03].metric_ids {{goal_metric_map[goal_03].pass_conditio
}}
n}}

5) Guardrails (Optional)
Metrics that must not degrade while optimizing core success.
metric
_id

metric_name

gr_01

{{guardrails[0].na
me}}

definition

threshold

{{guardrails[0].definiti {{guardrails[0].thres
on}}
hold}}

owner
{{guardrails[0].ow
ner}}

6) Measurement Notes
● Primary data sources: {{measurement.data_sources}} | OPTIONAL
● Segmentation rules: {{measurement.segments}} | OPTIONAL
● Attribution/identity assumptions: {{measurement.attribution}} | OPTIONAL

7) Open Questions (Optional)
● {{open_questions[0]}} | OPTIONAL
● {{open_questions[1]}} | OPTIONAL

Cross-References
● Upstream: {{xref:PRD-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
● Downstream: {{xref:SMIP-01}} | OPTIONAL, {{xref:SMIP-02}} | OPTIONAL,
{{xref:PRD-04}}, {{xref:QA-01}} | OPTIONAL
● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Targets/baselines may be UNKNOWN; mappings must still exist.
● intermediate: Required. Replace UNKNOWN with sourced targets where inputs exist;
add cadence/owner for each metric.
● advanced: Required. Add pass/fail thresholds per metric and explicit guardrails; ensure
metric logic is implementation-ready.

Unknown Handling

● UNKNOWN_ALLOWED: baseline_values, targets, data_sources, segments,
attribution, guardrails, open_questions
● If a goal lacks any measurable metric → block Completeness Gate (no UNKNOWN
exception).

Completeness Gate
● Gate ID: TMP-05.PRIMARY.PROD
● Pass conditions:
○ required_fields_present == true
○ every_goal_has_metric_mapping == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

PRD-03

PRD-03 — Personas & Roles
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

●
●
●
●
●
●

Guardrail metrics | OPTIONAL
Baseline values (current) | OPTIONAL
Leading vs lagging classification | OPTIONAL
Segment definitions (per persona / tier) | OPTIONAL
Data source notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Goals must be outcome-oriented; features do not qualify as goals.**
- **Non-goals must be explicit and testable (what will not be built / supported).**
- **Metrics must be measurable; if not measurable, mark UNKNOWN and create an**
- **instrumentation question.**
- If a metric depends on analytics events, reference: {{xref:SMIP-02}} | OPTIONAL
- Do not invent baselines/targets; if missing, mark UNKNOWN (unless standards
- **disallow).**
- If a goal has no metric mapping, it fails the Completeness Gate.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Goals`
2. `## List outcomes the product must achieve.`
3. `## goal_i`
4. `## goal_statement`
5. `## primary_user_type`
6. `## mapped_feature_id`
7. `## notes`
8. `## goal_`
9. `## t}}`
10. `## r}}`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- Downstream: {{xref:SMIP-01}} | OPTIONAL, {{xref:SMIP-02}} | OPTIONAL,
- **{{xref:PRD-04}}, {{xref:QA-01}} | OPTIONAL**
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
