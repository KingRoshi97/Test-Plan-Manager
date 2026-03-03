# SKM-10 — Secrets Compliance & Audit

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-10                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring secrets compliance & audi |
| Filled By         | Internal Agent                                   |
| Consumes          | SKM-02, SKM-03, SEC-06                           |
| Produces          | Filled Secrets Compliance & Audit                |

## 2. Purpose

Define the canonical observability and alerting for secrets/key management: access spikes, denied access, rotation failures, expiring certs, and configuration drift. This template must align with security monitoring and audit anomaly detection.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets inventory: {{xref:SKM-01}} | OPTIONAL
- Storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Rotation policy: {{xref:SKM-03}} | OPTIONAL
- Security monitoring baseline: {{xref:SEC-06}} | OPTIONAL
- Audit anomaly detection: {{xref:AUDIT-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Dashboards minimum panels (secrets health) | No |
| Key metrics list (reads, writes, denies, rotation success) | No |
| Alert registry (alert_id list) | No |
| Alert definitions (access spike, deny spike, rotation fail, cert expiring) | No |
| Alert routing policy (security/oncall) | No |
| Noise control rules (dedupe, suppression) | No |
| Runbook references (SKM-08, SEC-10) | Yes |
| Retention rules for secrets telemetry (no secret material) | No |
| Telemetry redaction rule (metadata only) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Drift detection rules (policy mismatches) | OPTIONAL |
| Automated remediation hooks | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not include secret material in telemetry; metadata only.
- Alerts must be actionable and link to runbooks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SKM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SEC-05}}, {{xref:COMP-09}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define dashboard min panels, metrics list, and alert list. |
| Intermediate | Required. Define alert conditions/routing and noise controls and retention. |
| Advanced | Required. Add drift rules and automated remediation hooks and strict runbook mapping. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, panel list, runbook refs, suppression rules/windows, drift rules, auto remediation, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If dash.minimum_panels is UNKNOWN → block Completeness Gate.
- If metrics.list is UNKNOWN → block Completeness Gate.
- If alerts.list is UNKNOWN → block Completeness Gate.
- If retention.days is UNKNOWN → block Completeness Gate.
- If redact.rule is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] dashboards_and_alerts_defined == true
- [ ] noise_controls_defined == true
- [ ] retention_and_redaction_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

