# AUDIT-10 — Forensics Runbooks (incident support procedures)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-10                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring forensics runbooks (incident support procedures)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Forensics Runbooks (incident support procedures) Document                         |

## 2. Purpose

Define the canonical forensics runbooks used during security/privacy incidents: evidence
collection, query recipes, export/chain-of-custody steps, and handoffs. This template must align
with investigation workflow and incident response plans.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
- Incident response plan: {{xref:SEC-05}} | OPTIONAL
- Audit anomaly rules: {{xref:AUDIT-09}} | OPTIONAL
- Security runbooks: {{xref:SEC-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Runbook registry (runb... | spec         | Yes             |
| runbook_id (stable ide... | spec         | Yes             |
| Incident type binding ... | spec         | Yes             |
| Trigger (alert_id/rule... | spec         | Yes             |
| Evidence capture check... | spec         | Yes             |
| Standard query recipes... | spec         | Yes             |
| Export steps (format, ... | spec         | Yes             |
| Chain-of-custody steps    | spec         | Yes             |
| Escalation/handoff rules  | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

External counsel handoff | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Exports must be integrity-protected; chain-of-custody must be maintained.
Runbooks must be executable and step-by-step.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_runbooks: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Runbooks (repeat)
Runbook
runbook_id: {{books[0].runbook_id}}
incident_type: {{books[0].incident_type}}
trigger: {{books[0].trigger}}
evidence_checklist: {{books[0].evidence_checklist}}
query_recipes:
{{books[0].query_recipes[0]}}
{{books[0].query_recipes[1]}} | OPTIONAL
export_steps: {{books[0].export_steps}}
chain_of_custody: {{books[0].chain_of_custody}}
handoff_rule: {{books[0].handoff_rule}}
telemetry_metric: {{books[0].telemetry_metric}}
counsel_handoff: {{books[0].counsel_handoff}} | OPTIONAL
open_questions:
{{books[0].open_questions[0]}} | OPTIONAL
(Repeat per runbook.)
3. References
Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
Security IR: {{xref:SEC-05}} | OPTIONAL
Security runbooks: {{xref:SEC-10}} | OPTIONAL
Cross-References
Upstream: {{xref:AUDIT-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SEC-05}}, {{xref:COMP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define runbooks with evidence checklist and export steps.
intermediate: Required. Add query recipes and escalation/handoff rules and telemetry.
advanced: Required. Add counsel handoff details and tighter trigger mappings and automation
hooks.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, optional query recipe,
counsel handoff, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If books[].runbook_id is UNKNOWN → block Completeness Gate.
If books[].evidence_checklist is UNKNOWN → block Completeness Gate.
If books[].export_steps is UNKNOWN → block Completeness Gate.
If books[].chain_of_custody is UNKNOWN → block Completeness Gate.
If books[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.AUDIT
Pass conditions:
required_fields_present == true
runbooks_defined == true
evidence_and_export_defined == true
chain_of_custody_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Compliance & Risk (COMP)

COMP-01

COMP-01 — Compliance Scope (frameworks, in/out scope)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Exports must be integrity-protected; chain-of-custody must be maintained.**
- **Runbooks must be executable and step-by-step.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Runbooks (repeat)`
3. `## Runbook`
4. `## query_recipes:`
5. `## open_questions:`
6. `## (Repeat per runbook.)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-05}}, {{xref:COMP-10}} | OPTIONAL**
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
