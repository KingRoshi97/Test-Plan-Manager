# PRIV-10 — Privacy Compliance Mapping (GDPR/CCPA/LGPD coverage)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-10                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring privacy compliance mappin |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-01, PRIV-03, PRIV-05, COMP-10               |
| Produces          | Filled Privacy Compliance Mapping (GDPR/CCPA/LGPD|

## 2. Purpose

Define the canonical privacy metrics and audit program: coverage metrics for inventories and consent, violation monitoring, deletion/retention audits, and periodic review cadence. This template must align with audit anomaly detection and compliance reporting.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Minimization rules: {{xref:PRIV-03}} | OPTIONAL
- Retention/deletion policy: {{xref:PRIV-05}} | OPTIONAL
- Compliance reporting: {{xref:COMP-10}} | OPTIONAL
- Audit anomaly detection: {{xref:AUDIT-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Core privacy metrics list | spec         | No              |
| Violation metrics list (m | spec         | No              |
| Deletion/retention audit  | spec         | No              |
| Audit cadence (monthly/qu | spec         | No              |
| Owners (who reviews)      | spec         | No              |
| Evidence artifacts produc | spec         | No              |
| Escalation rules (violati | spec         | No              |
| Telemetry requirements (m | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| External audit support    | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Audits must be repeatable and produce evidence artifacts.
- Violations must have escalation paths tied to PRIV-09/SEC-05.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Privacy Compliance Mapping (GDPR/CCPA/LGPD coverage)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-09}}, {{xref:SEC-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, evidence storage, incident ref, external
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If metrics.core is UNKNOWN → block Completeness Gate.
- If audit.checks is UNKNOWN → block Completeness Gate.
- If cadence.value is UNKNOWN → block Completeness Gate.
- If owners.list is UNKNOWN → block Completeness Gate.
- If telemetry.published_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PRIV
- Pass conditions:
- [ ] required_fields_present == true
- [ ] metrics_defined == true
- [ ] audit_checks_defined == true
- [ ] cadence_and_owners_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Audit Logging & Forensics (AUDIT)
- [ ] AUDIT-01
