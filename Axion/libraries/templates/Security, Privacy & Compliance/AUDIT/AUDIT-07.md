# AUDIT-07 — Admin/Privileged Actions Audit (special handling)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-07                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring admin/privileged actions audit (special handling)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Admin/Privileged Actions Audit (special handling) Document                         |

## 2. Purpose

Define the special audit requirements for admin and privileged actions: stricter capture rules,
extra context fields, required approvals/step-up, and alerting on unusual activity. This template
must align with privileged access policies and admin capabilities.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- Admin capabilities matrix: {{xref:ADMIN-01}} | OPTIONAL
- Privileged API catalog: {{xref:ADMIN-05}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Privileged action type... | spec         | Yes             |
| Mapping to admin capab... | spec         | Yes             |
| Extra required audit f... | spec         | Yes             |
| Step-up requirement ru... | spec         | Yes             |
| Approval requirement r... | spec         | Yes             |
| Real-time alerting rul... | spec         | Yes             |
| Retention class for pr... | spec         | Yes             |
| Redaction rules (no PI... | spec         | Yes             |

## 5. Optional Fields

2-person rule policy | OPTIONAL
Just-in-time access coupling | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Privileged actions must always be audited (no sampling).
Ticket/reason fields should be required for destructive actions.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Privileged Actions
action_ids: {{actions.ids}}
2. Mapping
capability_mapping: {{map.capability_mapping}}
3. Required Fields (extra)
extra_fields: {{fields.extra}}
reason_required_rule: {{fields.reason_required_rule}} | OPTIONAL
4. Step-up / Approvals
step_up_ref: {{xref:SSO-07}} | OPTIONAL
step_up_rule: {{step.rule}}
approval_required: {{approve.required}} | OPTIONAL
approval_rule: {{approve.rule}} | OPTIONAL
5. Alerts
alert_rule: {{alerts.rule}}
alert_ids: {{alerts.ids}} | OPTIONAL
6. Retention / Redaction
retention_class: {{retention.class}}
redaction_rule: {{redact.rule}}
7. Telemetry
privileged_action_metric: {{telemetry.action_metric}}
admin_anomaly_metric: {{telemetry.anomaly_metric}} | OPTIONAL
8. References
Admin access policy: {{xref:IAM-06}} | OPTIONAL
Audit schema: {{xref:AUDIT-02}} | OPTIONAL
Cross-References
Upstream: {{xref:IAM-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:AUDIT-09}}, {{xref:SEC-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define action list, extra fields, and retention class.
intermediate: Required. Define step-up rule, alert rule, and telemetry metrics.
advanced: Required. Add 2-person/JIT coupling and strict destructive-action reason rules.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, reason rule, approvals, alert ids,

anomaly metric, 2-person/jit, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If actions.ids is UNKNOWN → block Completeness Gate.
If fields.extra is UNKNOWN → block Completeness Gate.
If step.rule is UNKNOWN → block Completeness Gate.
If retention.class is UNKNOWN → block Completeness Gate.
If telemetry.action_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.AUDIT
Pass conditions:
required_fields_present == true
privileged_actions_defined == true
extra_fields_defined == true
alerts_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

AUDIT-08

AUDIT-08 — Redaction & PII Handling (safe storage of audit data)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Privileged actions must always be audited (no sampling).**
- **Ticket/reason fields should be required for destructive actions.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Privileged Actions`
2. `## Mapping`
3. `## Required Fields (extra)`
4. `## Step-up / Approvals`
5. `## Alerts`
6. `## Retention / Redaction`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:IAM-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-09}}, {{xref:SEC-06}} | OPTIONAL**
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
