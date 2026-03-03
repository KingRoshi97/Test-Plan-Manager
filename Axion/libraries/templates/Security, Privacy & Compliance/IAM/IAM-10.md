# IAM-10 — IAM Compliance & Audit (access reviews, certification)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-10                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring iam compliance & audit (a |
| Filled By         | Internal Agent                                   |
| Consumes          | IAM-03, AUDIT-02, SEC-06                         |
| Produces          | Filled IAM Compliance & Audit (access reviews, ce|

## 2. Purpose

Define the canonical observability for authentication and authorization: required logs, metrics, dashboards, and alerts for access failures, suspicious patterns, and policy denials. This template must align with audit schema requirements and security monitoring.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Auth methods: {{xref:IAM-02}} | OPTIONAL
- Session policy: {{xref:IAM-03}} | OPTIONAL
- AuthZ enforcement points: {{xref:IAM-04}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- Security monitoring: {{xref:SEC-06}} | OPTIONAL
- Logging/redaction: {{xref:CER-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Log event types list (log | spec         | No              |
| Required log fields (time | spec         | No              |
| Redaction rules (no token | spec         | No              |
| Core metrics (success rat | spec         | No              |
| Dashboards minimum panels | spec         | No              |
| Alerts (credential stuffi | spec         | No              |
| Alert routing policy (onc | spec         | No              |
| Retention rules for auth  | spec         | No              |
| High-cardinality controls | spec         | No              |
| Runbook references (SEC-1 | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Geo anomaly rules         | spec         | Enrichment only, no new truth  |
| Risk scoring notes        | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never log tokens/secrets.
- User identifiers should be hashed in logs unless explicitly approved.
- Alerts must be actionable and link to runbooks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## IAM Compliance & Audit (access reviews, certification)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:IAM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-09}}, {{xref:SEC-05}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, hashing rule, panel list, runbook refs,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If events.types is UNKNOWN → block Completeness Gate.
- If logs.required_fields is UNKNOWN → block Completeness Gate.
- If redact.no_token_logging_rule is UNKNOWN → block Completeness Gate.
- If dash.minimum_panels is UNKNOWN → block Completeness Gate.
- If retention.days is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.IAM
- Pass conditions:
- [ ] required_fields_present == true
- [ ] event_types_and_logs_defined == true
- [ ] redaction_defined == true
- [ ] dashboards_and_alerts_defined == true
- [ ] retention_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Threat Modeling & Abuse Prevention
- [ ] (TMA)
- [ ] TMA-01
