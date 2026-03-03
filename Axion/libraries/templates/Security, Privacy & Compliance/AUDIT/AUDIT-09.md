# AUDIT-09 — Audit Observability (volume, lag, completeness metrics)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-09                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit observability (volu |
| Filled By         | Internal Agent                                   |
| Consumes          | AUDIT-01, AUDIT-07, SEC-06                       |
| Produces          | Filled Audit Observability (volume, lag, complete|

## 2. Purpose

Define the canonical alerting and anomaly detection rules built on audit data: suspicious patterns, thresholds, routing, and runbooks. This template must align with security monitoring and privileged action audit requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Privileged action audit: {{xref:AUDIT-07}} | OPTIONAL
- Security monitoring baseline: {{xref:SEC-06}} | OPTIONAL
- Access observability: {{xref:IAM-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Detection rule registry ( | spec         | No              |
| rule_id (stable identifie | spec         | No              |
| Event types used (AUDIT-0 | spec         | No              |
| Pattern/condition (thresh | spec         | No              |
| Severity (low/med/high/UN | spec         | No              |
| Routing (oncall/security) | spec         | No              |
| Suppression/dedupe rules  | spec         | No              |
| Runbook reference (SEC-10 | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| ML-based detection notes  | spec         | Enrichment only, no new truth  |
| Tuning process            | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Every rule must have routing and a runbook.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Observability (volume, lag, completeness metrics)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:AUDIT-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-10}}, {{xref:SEC-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, false positive tracking, tuning
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If rules[].rule_id is UNKNOWN → block Completeness Gate.
- If rules[].condition is UNKNOWN → block Completeness Gate.
- If rules[].routing is UNKNOWN → block Completeness Gate.
- If rules[].runbook_ref is UNKNOWN → block Completeness Gate.
- If rules[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] rule_registry_defined == true
- [ ] each_rule_has_routing_and_runbook == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-10
