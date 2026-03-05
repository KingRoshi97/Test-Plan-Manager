# COST-04 — Budget & Alerts (thresholds, routing)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-04                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring budget & alerts (thresholds, routing)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Budget & Alerts (thresholds, routing) Document                         |

## 2. Purpose

Define the canonical cost budgets and alerting: what thresholds exist, how they are evaluated,
who gets notified, and what actions are required when budgets are exceeded or trending poorly.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Cost model overview: {{xref:COST-01}} | OPTIONAL
- Forecast model: {{xref:COST-03}} | OPTIONAL
- Cost drivers catalog: {{xref:COST-02}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Routing/ownership: {{xref:OBS-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Budget registry (budge... | spec         | Yes             |
| budget_id (stable iden... | spec         | Yes             |
| Scope (global/team/ser... | spec         | Yes             |
| Budget amount (monthly)   | spec         | Yes             |
| Thresholds (warn/breach)  | spec         | Yes             |
| Evaluation cadence (da... | spec         | Yes             |
| Alert routing (team/on... | spec         | Yes             |
| Owner (finops/team)       | spec         | Yes             |
| Action rules (what to ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Anomaly detection rule | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Budgets must be scoped and attributable; avoid “misc” budgets.
Alerts must route to owners and include actionable guidance.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_budgets: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Budgets (repeat)
Budget
budget_id: {{budgets[0].budget_id}}
scope: {{budgets[0].scope}}
amount_monthly: {{budgets[0].amount_monthly}}
thresholds: {{budgets[0].thresholds}}
cadence: {{budgets[0].cadence}}
routing: {{budgets[0].routing}}
owner: {{budgets[0].owner}}
actions: {{budgets[0].actions}}
anomaly_rule: {{budgets[0].anomaly_rule}} | OPTIONAL
telemetry_metric: {{budgets[0].telemetry_metric}}
open_questions:
{{budgets[0].open_questions[0]}} | OPTIONAL
(Repeat per budget.)
3. References
Cost reporting: {{xref:COST-09}} | OPTIONAL
Optimization backlog: {{xref:COST-06}} | OPTIONAL
Cross-References
Upstream: {{xref:COST-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-06}}, {{xref:COST-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define budgets with scope/amount/thresholds and routing and actions.
intermediate: Required. Define cadence and telemetry metric per budget.
advanced: Required. Add anomaly detection rule and strict escalation + post-breach review
practices.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, anomaly rule, open_questions

If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If budgets[].budget_id is UNKNOWN → block Completeness Gate.
If budgets[].amount_monthly is UNKNOWN → block Completeness Gate.
If budgets[].thresholds is UNKNOWN → block Completeness Gate.
If budgets[].routing is UNKNOWN → block Completeness Gate.
If budgets[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
budget_registry_defined == true
thresholds_defined == true
routing_defined == true
actions_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-05

COST-05 — Unit Economics (cost per user/action)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Budgets must be scoped and attributable; avoid “misc” budgets.**
- **Alerts must route to owners and include actionable guidance.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Budgets (repeat)`
3. `## Budget`
4. `## open_questions:`
5. `## (Repeat per budget.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:COST-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-06}}, {{xref:COST-10}} | OPTIONAL**
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
