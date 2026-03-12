# SLO-01 — SLO/SLI Overview (definitions, scope)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-01                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring slo/sli overview (definitions, scope)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled SLO/SLI Overview (definitions, scope) Document                         |

## 2. Purpose

Create the canonical overview of reliability targets: what SLIs/SLOs/SLAs mean for this system,
what is in-scope, and how error budgets drive engineering decisions. This document anchors
the SLO set and links observability to reliability governance.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Alerting overview: {{xref:ALRT-01}} | OPTIONAL
- Incident severity model: {{xref:IRP-01}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Error budget policy: {{xref:SLO-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Definitions (SLI, SLO, SLA)
In-scope services/surfaces
Out-of-scope statement (explicit)
SLI measurement principles (user-centric)
SLO target selection principles
Error budget concept and use
Ownership model (who owns SLOs)
Review cadence (monthly/quarterly)
Tooling references (dashboards/alerts)
Telemetry requirements (SLO calculation failures)

Optional Fields
Initial MVP targets notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
SLOs must be measurable with defined SLIs; no vague targets.
Do not claim external SLAs unless explicitly defined in contracts.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Definitions
sli: {{defs.sli}}
slo: {{defs.slo}}
sla: {{defs.sla}}
2. Scope
in_scope: {{scope.in_scope}}
out_of_scope: {{scope.out_of_scope}} | OPTIONAL
3. Measurement Principles
principles: {{measure.principles}}
4. Target Selection
selection_rule: {{targets.selection_rule}}
5. Error Budgets
budget_definition: {{budget.definition}}
budget_usage_rule: {{budget.usage_rule}} | OPTIONAL
6. Ownership & Cadence
owner_rule: {{owners.owner_rule}}
review_cadence: {{owners.review_cadence}}
7. Tooling
dashboards_ref: {{xref:OBS-07}} | OPTIONAL
alerts_ref: {{xref:ALRT-02}} | OPTIONAL
8. Telemetry
slo_calc_fail_metric: {{telemetry.slo_calc_fail_metric}}
Cross-References
Upstream: {{xref:OBS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SLO-02}}, {{xref:SLO-04}}, {{xref:SLO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define definitions, scope, and ownership/cadence.
intermediate: Required. Define measurement principles and error budget usage and telemetry.
advanced: Required. Add MVP targets notes and strict selection rationale + traceability.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, out of scope, budget usage, tooling refs,
MVP notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If defs.sli or defs.slo is UNKNOWN → block Completeness Gate.
If scope.in_scope is UNKNOWN → block Completeness Gate.
If owners.owner_rule is UNKNOWN → block Completeness Gate.
If owners.review_cadence is UNKNOWN → block Completeness Gate.
If telemetry.slo_calc_fail_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
definitions_defined == true
scope_defined == true
ownership_and_cadence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-02

SLO-02 — Service SLO Catalog (by service_id)
Header Block

## 5. Optional Fields

Initial MVP targets notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **SLOs must be measurable with defined SLIs; no vague targets.**
- Do not claim external SLAs unless explicitly defined in contracts.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Definitions`
2. `## Scope`
3. `## Measurement Principles`
4. `## Target Selection`
5. `## Error Budgets`
6. `## Ownership & Cadence`
7. `## Tooling`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:OBS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SLO-02}}, {{xref:SLO-04}}, {{xref:SLO-10}} | OPTIONAL**
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
