# SKM-06 — Certificate Management Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-06                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring certificate management sp |
| Filled By         | Internal Agent                                   |
| Consumes          | SKM-03, IAM-05, SEC-04                           |
| Produces          | Filled Certificate Management Spec               |

## 2. Purpose

Define the canonical lifecycle for certificates (TLS/mTLS): issuance, renewal, rotation, revocation, and monitoring. This template must align with service-to-service auth and rotation policies and ensure cert expiry does not cause outages.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Rotation policy: {{xref:SKM-03}} | OPTIONAL
- Service-to-service auth: {{xref:IAM-05}} | OPTIONAL
- Vulnerability management: {{xref:SEC-04}} | OPTIONAL
- Integration inventory (providers): {{xref:IXS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Certificate types list (public TLS, internal mTLS) | No |
| Issuance model (ACME/CA/internal/UNKNOWN) | Yes |
| Certificate authority/provider binding | No |
| Renewal cadence (days before expiry) | No |
| Rotation/overlap rules (dual cert support) | Yes |
| Revocation rules (when/how) | No |
| Distribution mechanism (how services get certs) | No |
| Monitoring/alerts (expiring soon, failures) | No |
| Audit requirements (issuance/revocation events) | No |
| Telemetry requirements (renewal success/fail, expiry warnings) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| SAN naming conventions | OPTIONAL |
| Certificate pinning notes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Certificates must be rotated before expiry with clear monitoring.
- Revocation must be runnable during incidents.
- Private keys must never be logged or stored insecurely.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SKM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SKM-08}}, {{xref:SKM-10}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define issuance model, renewal days, and revocation rule. |
| Intermediate | Required. Define overlap/dual cert and monitoring alerts and telemetry. |
| Advanced | Required. Add naming/pinning notes and strict distribution and audit event details. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, ca ref, trigger rule, dual cert rule, alerts, audit events, optional telemetry, naming/pinning, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If cert.types is UNKNOWN → block Completeness Gate.
- If cert.issuance_model is UNKNOWN → block Completeness Gate.
- If renew.before_days is UNKNOWN → block Completeness Gate.
- If revoke.rule is UNKNOWN → block Completeness Gate.
- If telemetry.renewal_success_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] issuance_and_renewal_defined == true
- [ ] revocation_defined == true
- [ ] monitoring_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

