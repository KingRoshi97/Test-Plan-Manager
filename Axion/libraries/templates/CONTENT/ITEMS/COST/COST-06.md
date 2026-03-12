# COST-06 — Optimization Backlog (ranked opportunities)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-06                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring optimization backlog (ranked opportunities)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Optimization Backlog (ranked opportunities) Document                         |

## 2. Purpose

Create the canonical backlog of cost optimization opportunities, ranked by impact and effort,
with clear owners and evidence. This template turns cost insights into actionable work rather
than ad hoc ideas.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Cost drivers: {{xref:COST-02}} | OPTIONAL
- Budgets/alerts: {{xref:COST-04}} | OPTIONAL
- Cost reporting: {{xref:COST-09}} | OPTIONAL
- Scaling strategy: {{xref:PERF-05}} | OPTIONAL
- Change management: {{xref:REL-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Opportunity registry (opt_id list)
opt_id (stable identifier)
Driver linkage (driver_id)
Opportunity description
Estimated monthly savings
Effort estimate (S/M/L)
Risk level (low/med/high)
Owner (team)
Status (backlog/in-progress/done)
Evidence link (cost report/chart)
Telemetry requirements (savings realized metric)

Optional Fields
Dependencies | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Each opportunity must link to a measurable driver and evidence.
Savings estimates must be grounded or marked UNKNOWN; avoid invented numbers.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_opportunities: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Opportunities (repeat)
Opportunity
opt_id: {{opts[0].opt_id}}
driver_id: {{opts[0].driver_id}}
description: {{opts[0].description}}
savings_monthly: {{opts[0].savings_monthly}}
effort: {{opts[0].effort}}
risk: {{opts[0].risk}}
owner: {{opts[0].owner}}
status: {{opts[0].status}}
evidence: {{opts[0].evidence}}
deps: {{opts[0].deps}} | OPTIONAL
telemetry_metric: {{opts[0].telemetry_metric}}
open_questions:
{{opts[0].open_questions[0]}} | OPTIONAL
(Repeat per opportunity.)
3. References
Cost drivers: {{xref:COST-02}} | OPTIONAL
Change workflow: {{xref:REL-02}} | OPTIONAL
Cross-References
Upstream: {{xref:COST-09}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-10}}, {{xref:REL-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define opportunity list, driver linkage, owner, and evidence.
intermediate: Required. Define savings estimate and effort/risk and telemetry.

advanced: Required. Add dependency mapping and strict “realized savings” verification and
closure criteria.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, deps, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If opts[].opt_id is UNKNOWN → block Completeness Gate.
If opts[].driver_id is UNKNOWN → block Completeness Gate.
If opts[].owner is UNKNOWN → block Completeness Gate.
If opts[].evidence is UNKNOWN → block Completeness Gate.
If opts[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
opportunity_registry_defined == true
driver_and_evidence_defined == true
ownership_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-07

COST-07 — Showback/Chargeback Policy (by team/tenant)
Header Block

## 5. Optional Fields

Dependencies | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Each opportunity must link to a measurable driver and evidence.
- **Savings estimates must be grounded or marked UNKNOWN; avoid invented numbers.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Opportunities (repeat)`
3. `## Opportunity`
4. `## open_questions:`
5. `## (Repeat per opportunity.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:COST-09}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-10}}, {{xref:REL-02}} | OPTIONAL**
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
