# NOTIF-10 — Notification Compliance (CAN-SPAM, GDPR consent, audit)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-10                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring notification compliance ( |
| Filled By         | Internal Agent                                   |
| Consumes          | NOTIF-04, NOTIF-05, NOTIF-09, IXS-07             |
| Produces          | Filled Notification Compliance (CAN-SPAM, GDPR co|

## 2. Purpose

Define the canonical observability and support runbooks for notifications: dashboards, alerts, triage flows, and operator actions for delivery issues (throttling, bounces, provider outages, DLQ backlogs). This template must be consistent with send/deliverability/failure policies and integration observability.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- NOTIF-04 Send Policy: {{notif.send_policy}} | OPTIONAL
- NOTIF-05 Deliverability Rules: {{notif.deliverability}} | OPTIONAL
- NOTIF-09 Failure Handling: {{notif.failures}} | OPTIONAL
- IXS-07 Integration Observability: {{ixs.observability}} | OPTIONAL
- ADMIN-02 Support Tools: {{admin.support_tools}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Dashboards minimum panels | spec         | No              |
| Key metrics list (send, d | spec         | No              |
| Alert definitions (delive | spec         | No              |
| Alert routing policy (onc | spec         | No              |
| Runbook location and form | spec         | No              |
| Triage flows (by incident | spec         | No              |
| Operator actions (pause s | spec         | No              |
| Permissioning requirement | spec         | No              |
| Customer comms triggers ( | spec         | No              |
| Post-incident review requ | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| SLOs per channel          | spec         | Enrichment only, no new truth  |
| Auto-mitigation rules (sw | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Alerts must be actionable and reference triage steps.
- Operator actions must be permissioned and auditable.
- Dashboards must avoid PII; use aggregates/hashes only.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Notification Compliance (CAN-SPAM, GDPR consent, audit)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:NOTIF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-06}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, panel list, optional tools, runbook format,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If dash.minimum_panels is UNKNOWN → block Completeness Gate.
- If metrics.list is UNKNOWN → block Completeness Gate.
- If alerts list is UNKNOWN → block Completeness Gate.
- If triage[0].steps[0] is UNKNOWN → block Completeness Gate.
- If post.rca_required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] dashboards_and_alerts_defined == true
- [ ] triage_and_actions_defined == true
- [ ] comms_and_post_incident_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Files/Media & Storage (FMS)
- [ ] FMS-01
