# TMA-10 — TMA Runbooks (triage, containment actions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-10                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring tma runbooks (triage, containment actions)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled TMA Runbooks (triage, containment actions) Document                         |

## 2. Purpose

Define the canonical runbooks for abuse/threat scenarios (non-incident and incident-adjacent):
triage, containment actions, evidence capture, and escalation. This template should connect
abuse cases and risks to concrete operator steps and must align with security runbooks and
enforcement matrices.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Abuse catalog: {{xref:TMA-02}} | OPTIONAL
- Risk register: {{xref:TMA-04}} | OPTIONAL
- Security runbooks: {{xref:SEC-10}} | OPTIONAL
- Enforcement matrix: {{xref:RLIM-04}} | OPTIONAL
- Support tools: {{xref:ADMIN-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Runbook registry (runbook_id list)
runbook_id (stable identifier)
Linked abuse_id/risk_id
Trigger signals (what starts it)
Triage steps (ordered)
Containment/enforcement actions (ordered)
Evidence capture checklist
Escalation rules (when to involve security/legal)
Permissions required
Audit requirements
Telemetry requirements (invocations, time-to-mitigate)

Optional Fields
Customer comms pointers | OPTIONAL
Automation hooks | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Every runbook must map to at least one abuse_id or risk_id.
Containment actions must be permissioned and auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_runbooks: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Runbooks (repeat per runbook_id)
Runbook
runbook_id: {{books[0].runbook_id}}
abuse_id: {{books[0].abuse_id}} | OPTIONAL
risk_id: {{books[0].risk_id}} | OPTIONAL
triggers: {{books[0].triggers}}
triage_steps:
{{books[0].triage_steps[0]}}
{{books[0].triage_steps[1]}}
actions:
{{books[0].actions[0]}}
{{books[0].actions[1]}} | OPTIONAL
evidence_checklist: {{books[0].evidence_checklist}}
escalation_rule: {{books[0].escalation_rule}}
permissions_required: {{books[0].permissions_required}}
audit_required: {{books[0].audit_required}}
telemetry:
invoked_metric: {{books[0].telemetry.invoked_metric}}
ttm_metric: {{books[0].telemetry.ttm_metric}} | OPTIONAL
(Repeat per runbook.)
3. References
Security runbooks: {{xref:SEC-10}} | OPTIONAL
Enforcement actions: {{xref:RLIM-04}} | OPTIONAL
Support tools: {{xref:ADMIN-02}} | OPTIONAL
Cross-References
Upstream: {{xref:TMA-02}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:SEC-05}}, {{xref:AUDIT-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define registry, triggers, triage steps, and at least one action per runbook.
intermediate: Required. Define evidence, escalation, permissions/audit, and telemetry.
advanced: Required. Add automation hooks and customer comms pointers and stricter
mappings.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, optional risk/abuse id (one
required), optional steps, optional metrics, comms/automation hooks, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If books[].runbook_id is UNKNOWN → block Completeness Gate.
If books[].triage_steps[0] is UNKNOWN → block Completeness Gate.
If books[].actions[0] is UNKNOWN → block Completeness Gate.
If books[].audit_required is UNKNOWN → block Completeness Gate.
If books[*].telemetry.invoked_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.TMA
Pass conditions:
required_fields_present == true
runbooks_defined == true
each_runbook_mapped_to_abuse_or_risk == true
permissions_and_audit_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Secrets & Key Management (SKM)

SKM-01

SKM-01 — Secrets Inventory (by secret_id)
Header Block

## 5. Optional Fields

Customer comms pointers | OPTIONAL
Automation hooks | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every runbook must map to at least one abuse_id or risk_id.**
- **Containment actions must be permissioned and auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Runbooks (repeat per runbook_id)`
3. `## Runbook`
4. `## triage_steps:`
5. `## actions:`
6. `## telemetry:`
7. `## (Repeat per runbook.)`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:TMA-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-05}}, {{xref:AUDIT-09}} | OPTIONAL**
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
