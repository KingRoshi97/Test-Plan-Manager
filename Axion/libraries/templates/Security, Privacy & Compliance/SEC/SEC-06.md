# SEC-06 — Network Security Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-06                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring network security spec     |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Network Security Spec                     |

## 2. Purpose

Define the canonical security monitoring requirements: what signals are collected, how they're aggregated, dashboards, alert definitions, routing, and runbook references. This template must be consistent with attack surface inventory and audit/anomaly expectations.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Security architecture: `{{xref:SEC-02}}` | OPTIONAL
- Attack surface inventory: `{{xref:TMA-03}}` | OPTIONAL
- Audit anomaly detection: `{{xref:AUDIT-09}}` | OPTIONAL
- Access observability: `{{xref:IAM-10}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Signal categories (auth, authz, data access, network, app abuse) | spec | No |
| Signal sources (logs/metrics/traces/providers) | spec | No |
| Dashboard requirements (minimum panels) | spec | No |
| Alert registry (alert_id list) | spec | No |
| Alert definitions (condition, severity) | spec | No |
| Routing policy (oncall/team) | spec | No |
| Triage/runbook references (SEC-10, AUDIT-10) | spec | Yes |
| Noise control rules (dedupe, suppression windows) | spec | No |
| Data retention for security telemetry | spec | No |
| Telemetry redaction rules (no secrets/PII) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| SIEM forwarding rules | spec | OPTIONAL |
| Detection-as-code approach | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Alerts must be actionable and link to a runbook.
- Telemetry must comply with logging/redaction rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SEC-10}}`, `{{xref:SEC-05}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define categories, one dashboard, and an alert list. |
| intermediate | Required. Define alert conditions/routing and noise controls and retention. |
| advanced | Required. Add SIEM forwarding, detection-as-code, and precise suppression rules. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, panel list, runbook refs, suppression rules/windows, siem/detection-as-code, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `signals.categories` is UNKNOWN → block Completeness Gate.
- If `dash.minimum_panels` is UNKNOWN → block Completeness Gate.
- If `alerts.list` is UNKNOWN → block Completeness Gate.
- If `retention.days` is UNKNOWN → block Completeness Gate.
- If `redact.rule` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] signals_defined == true
  - [ ] dashboards_defined == true
  - [ ] alerts_defined == true
  - [ ] retention_and_redaction_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

