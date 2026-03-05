# SLO-05 — SLA Commitments (external, contracts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-05                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring sla commitments (external, contracts)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled SLA Commitments (external, contracts) Document                         |

## 2. Purpose

Define the canonical external SLA commitments (if any): what is promised to customers, how
availability is measured, what credits/remedies exist, and how SLA reporting is performed. This
template must not invent SLAs; it only documents explicit commitments.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SLO overview: {{xref:SLO-01}} | OPTIONAL
- Compliance scope/contracts context: {{xref:COMP-01}} | OPTIONAL
- Release policy (versioning): {{xref:REL-01}} | OPTIONAL
- Service SLO catalog (internal targets): {{xref:SLO-02}} | OPTIONAL
- Customer impact rules: {{xref:ALRT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

SLA registry (sla_id list)
sla_id (stable identifier)
Customer segment/applicability (who covered)
Availability definition (what counts as downtime)
Measurement window (monthly/UNKNOWN)
Exclusions (planned maintenance)
Credit/remedy terms (or NONE/UNKNOWN)
Reporting process (how calculated, published)
Owner (legal/ops)
Telemetry requirements (sla calc failures, credits issued)

Optional Fields
Service mapping (service_id list) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Do not claim an SLA exists unless provided; use UNKNOWN or NONE.
SLA definitions must reference measurable signals (SLO/metrics).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_slas: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. SLAs (repeat)
SLA
sla_id: {{slas[0].sla_id}}
applicability: {{slas[0].applicability}}
availability_definition: {{slas[0].availability_definition}}
window: {{slas[0].window}}
exclusions: {{slas[0].exclusions}}
credits: {{slas[0].credits}}
reporting_process: {{slas[0].reporting_process}}
owner: {{slas[0].owner}}
service_mapping: {{slas[0].service_mapping}} | OPTIONAL
telemetry_metric: {{slas[0].telemetry_metric}}
credits_issued_metric: {{slas[0].credits_issued_metric}} | OPTIONAL
open_questions:
{{slas[0].open_questions[0]}} | OPTIONAL
(Repeat per SLA.)
3. References
Internal SLOs: {{xref:SLO-02}} | OPTIONAL
Customer comms: {{xref:ALRT-07}} | OPTIONAL
Reporting: {{xref:SLO-10}} | OPTIONAL
Cross-References
Upstream: {{xref:SLO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SLO-10}}, {{xref:COMP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define sla registry and availability definition and exclusions and reporting

process.
intermediate: Required. Define credits terms, owner, telemetry metrics.
advanced: Required. Add service mapping and strict evidence pointers to contracts and
measurement queries.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, credits terms, service mapping,
optional metrics, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If slas[].sla_id is UNKNOWN → block Completeness Gate.
If slas[].availability_definition is UNKNOWN → block Completeness Gate.
If slas[].reporting_process is UNKNOWN → block Completeness Gate.
If slas[].owner is UNKNOWN → block Completeness Gate.
If slas[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
sla_registry_defined == true
definitions_defined == true
reporting_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-06

SLO-06 — Measurement Rules (windows, aggregation)
Header Block

## 5. Optional Fields

Service mapping (service_id list) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Do not claim an SLA exists unless provided; use UNKNOWN or NONE.
- **SLA definitions must reference measurable signals (SLO/metrics).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## SLAs (repeat)`
3. `## SLA`
4. `## open_questions:`
5. `## (Repeat per SLA.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:SLO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SLO-10}}, {{xref:COMP-10}} | OPTIONAL**
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
