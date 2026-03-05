# COST-10 — Incident Cost Review (post-incident spend)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-10                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring incident cost review (post-incident spend)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Incident Cost Review (post-incident spend) Document                         |

## 2. Purpose

Define the canonical post-incident cost review process: how to quantify incremental spend
during incidents (scale-ups, egress spikes, vendor overages), how to record it, and how to feed
it into optimization/backlog and governance.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Postmortem template: {{xref:IRP-06}} | OPTIONAL
- Cost reporting: {{xref:COST-09}} | OPTIONAL
- Cost drivers catalog: {{xref:COST-02}} | OPTIONAL
- Budgets/alerts: {{xref:COST-04}} | OPTIONAL
- Privileged change audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Incident reference (in... | spec         | Yes             |
| Time window for cost a... | spec         | Yes             |
| Cost deltas by driver ... | spec         | Yes             |
| Primary causes (what c... | spec         | Yes             |
| Actions taken (scale u... | spec         | Yes             |
| Avoidable vs unavoidab... | spec         | Yes             |
| Follow-up actions (opt... | spec         | Yes             |
| Owner (finops/incident... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Customer credits linkage | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Cost review must be evidence-based (billing + tags) and linked to incident timeline.
Follow-ups must be created when avoidable deltas are found.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Reference
incident_id: {{ref.incident_id}}
postmortem_ref: {{xref:IRP-06}} | OPTIONAL
2. Window
start: {{window.start}}
end: {{window.end}}
3. Deltas
drivers: {{deltas.drivers}}
total_delta: {{deltas.total}} | OPTIONAL
4. Causes
causes: {{causes.list}}
5. Actions Taken
actions: {{actions.list}}
6. Classification
avoidable_rule: {{class.avoidable_rule}}
classification: {{class.classification}} | OPTIONAL
7. Follow-Ups
backlog_items: {{followups.backlog_items}}
owner: {{followups.owner}} | OPTIONAL
8. Telemetry
incident_cost_review_metric: {{telemetry.review_metric}}
Cross-References
Upstream: {{xref:IRP-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-06}}, {{xref:COST-04}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Fill incident ref, window, driver deltas, causes, telemetry.
intermediate: Required. Add avoidable classification, follow-ups, ownership.
advanced: Required. Add customer credits linkage and stricter evidence linkage + prevention
actions.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, total delta, classification optional,
followups owner, customer credits, open_questions
If any Required Field is UNKNOWN, allow only if:

{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If ref.incident_id is UNKNOWN → block Completeness Gate.
If window.start or window.end is UNKNOWN → block Completeness Gate.
If deltas.drivers is UNKNOWN → block Completeness Gate.
If causes.list is UNKNOWN → block Completeness Gate.
If telemetry.review_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
reference_and_window_defined == true
deltas_defined == true
followups_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Performance Budgets & Profiling (PBP)

PBP-01

PBP-01 — Performance Budgets Overview (web/mobile/api)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Cost review must be evidence-based (billing + tags) and linked to incident timeline.**
- **Follow-ups must be created when avoidable deltas are found.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Reference`
2. `## Window`
3. `## Deltas`
4. `## Causes`
5. `## Actions Taken`
6. `## Classification`
7. `## Follow-Ups`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:IRP-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-06}}, {{xref:COST-04}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
