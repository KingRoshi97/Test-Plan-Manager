# ALRT-01 — Alerting Overview (principles, severity model)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-01                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring alerting overview (principles, severity model)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Alerting Overview (principles, severity model) Document                         |

## 2. Purpose

Create the single, canonical overview of alerting for the system: what alerts are for, how severity
is defined, what should page vs ticket, and how alerts tie into incident response and SLO burn.
This document anchors the ALRT set.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Incident severity model: {{xref:IRP-01}} | OPTIONAL
- SLO/SLI overview: {{xref:SLO-01}} | OPTIONAL
- Alert routing/ownership: {{xref:OBS-08}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Oncall policy: {{xref:ALRT-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Alerting principles li... | spec         | Yes             |
| Severity model (sev le... | spec         | Yes             |
| Paging vs non-paging c... | spec         | Yes             |
| SLO burn linkage rule ... | spec         | Yes             |
| Ownership model (who o... | spec         | Yes             |
| Alert lifecycle (creat... | spec         | Yes             |
| Change control rule (w... | spec         | Yes             |
| Runbook requirement (a... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Alert review cadence | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Paging alerts must be actionable and owned; otherwise convert to ticket.
Every paging alert must have a runbook and escalation path.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Principles
{{principles[0]}}
{{principles[1]}}
{{principles[2]}} | OPTIONAL
2. Severity Model
levels: {{sev.levels}}
definitions: {{sev.definitions}} | OPTIONAL
3. Paging Criteria
paging_rule: {{page.rule}}
non_paging_rule: {{page.non_paging_rule}} | OPTIONAL
4. SLO / Error Budget Linkage
slo_link_rule: {{slo.link_rule}}
burn_alert_ref: {{xref:SLO-07}} | OPTIONAL
5. Ownership
ownership_rule: {{own.rule}}
routing_ref: {{xref:OBS-08}} | OPTIONAL
6. Lifecycle
lifecycle_steps: {{life.steps}}
retire_rule: {{life.retire_rule}} | OPTIONAL
7. Change Control
who_can_edit: {{change.who_can_edit}}
approval_rule: {{change.approval_rule}} | OPTIONAL
8. Runbooks
runbook_required_rule: {{runbooks.required_rule}}
runbook_index_ref: {{xref:IRP-10}} | OPTIONAL
9. Telemetry
alerts_fired_metric: {{telemetry.alerts_fired_metric}}
false_positive_metric: {{telemetry.false_positive_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:IRP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-02}}, {{xref:ALRT-03}}, {{xref:IRP-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define severity model, paging rule, ownership, runbook requirement.

intermediate: Required. Define SLO linkage, lifecycle steps, change control, telemetry.
advanced: Required. Add review cadence and explicit tuning/retirement thresholds.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional principles, definitions,
non-paging rule, burn ref, retire rule, approval rule, runbook index ref, optional metric, review
cadence, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If sev.levels is UNKNOWN → block Completeness Gate.
If page.rule is UNKNOWN → block Completeness Gate.
If own.rule is UNKNOWN → block Completeness Gate.
If runbooks.required_rule is UNKNOWN → block Completeness Gate.
If telemetry.alerts_fired_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ALRT
Pass conditions:
required_fields_present == true
severity_and_paging_defined == true
ownership_defined == true
runbooks_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ALRT-02

ALRT-02 — Alert Catalog (by alert_id)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Paging alerts must be actionable and owned; otherwise convert to ticket.**
- **Every paging alert must have a runbook and escalation path.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Principles`
2. `## Severity Model`
3. `## Paging Criteria`
4. `## SLO / Error Budget Linkage`
5. `## Ownership`
6. `## Lifecycle`
7. `## Change Control`
8. `## Runbooks`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:IRP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-02}}, {{xref:ALRT-03}}, {{xref:IRP-02}} | OPTIONAL**
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
