# SEC-10 — Security Runbooks (common incidents, operator actions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-10                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security runbooks (common incidents, operator actions)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Runbooks (common incidents, operator actions) Document                         |

## 2. Purpose

Define the canonical set of security runbooks for common incident types: step-by-step triage,
containment actions, evidence capture, and recovery checks. This template must align with the
incident response plan and monitoring alert registry and must not introduce operator actions that
are not permissioned/auditable.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Incident response plan: {{xref:SEC-05}} | OPTIONAL
- Security monitoring: {{xref:SEC-06}} | OPTIONAL
- Forensics runbooks: {{xref:AUDIT-10}} | OPTIONAL
- Secrets compromise response: {{xref:SKM-08}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Runbook registry (runbook_id list)
runbook_id (stable identifier)
incident type binding (must match SEC-05 types)
Trigger signals/alerts (from SEC-06)
Triage steps (ordered)
Containment actions (ordered)
Evidence capture checklist
Recovery validation steps
Escalation rule (when to page/notify)
Permissions required (role)
Audit requirements (log operator actions)
Telemetry requirements (runbook invoked, time-to-contain)

Optional Fields
Customer comms snippet pointers | OPTIONAL
Automation hooks | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Every runbook must map to at least one trigger signal and one containment action.
Operator actions must be permissioned and auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Runbook Registry Summary
total_runbooks: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Runbooks (repeat per runbook_id)
Runbook
runbook_id: {{books[0].runbook_id}}
incident_type: {{books[0].incident_type}}
triggers: {{books[0].triggers}}
triage_steps:
{{books[0].triage_steps[0]}}
{{books[0].triage_steps[1]}}
containment_actions:
{{books[0].containment_actions[0]}}
{{books[0].containment_actions[1]}} | OPTIONAL
evidence_checklist: {{books[0].evidence_checklist}}
recovery_validation: {{books[0].recovery_validation}}
escalation_rule: {{books[0].escalation_rule}}
permissions_required: {{books[0].permissions_required}}
audit_required: {{books[0].audit_required}}
telemetry:
invoked_metric: {{books[0].telemetry.invoked_metric}}
ttc_metric: {{books[0].telemetry.ttc_metric}} | OPTIONAL
(Repeat per runbook.)
3. References
Incident response plan: {{xref:SEC-05}} | OPTIONAL
Monitoring/alerts: {{xref:SEC-06}} | OPTIONAL
Secrets compromise: {{xref:SKM-08}} | OPTIONAL
Forensics runbooks: {{xref:AUDIT-10}} | OPTIONAL

Cross-References
Upstream: {{xref:SEC-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:AUDIT-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define runbook registry and triage/containment steps.
intermediate: Required. Define evidence checklist, escalation, and permissions/audit.
advanced: Required. Add automation hooks and tighter telemetry and cross-runbook reuse
patterns.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, optional containment steps,
optional metrics, comms snippets, automation hooks, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If books[].runbook_id is UNKNOWN → block Completeness Gate.
If books[].triage_steps[0] is UNKNOWN → block Completeness Gate.
If books[].containment_actions[0] is UNKNOWN → block Completeness Gate.
If books[].audit_required is UNKNOWN → block Completeness Gate.
If books[*].telemetry.invoked_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SEC
Pass conditions:
required_fields_present == true
runbooks_defined == true
each_runbook_has_triggers_and_actions == true
audit_and_permissions_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Identity & Access (IAM)

IAM-01

IAM-01 — Role & Permission Model (roles, permissions, inheritance)
Header Block

## 5. Optional Fields

Customer comms snippet pointers | OPTIONAL
Automation hooks | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every runbook must map to at least one trigger signal and one containment action.**
- **Operator actions must be permissioned and auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Runbook Registry Summary`
2. `## Runbooks (repeat per runbook_id)`
3. `## Runbook`
4. `## triage_steps:`
5. `## containment_actions:`
6. `## telemetry:`
7. `## (Repeat per runbook.)`
8. `## References`
9. `## Cross-References`
10. `## Skill Level Requiredness Rules`

## 8. Cross-References

- **Upstream: {{xref:SEC-05}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-06}} | OPTIONAL**
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
