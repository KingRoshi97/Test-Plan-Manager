# AUDIT-05 — Audit Search & Query Spec (filters, exports, APIs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-05                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit search & query spec |
| Filled By         | Internal Agent                                   |
| Consumes          | AUDIT-02, IAM-06, PRIV-05                        |
| Produces          | Filled Audit Search & Query Spec (filters, export|

## 2. Purpose

Define the canonical retention policy and access controls for audit logs: how long logs are retained per event category/class, who can view/export them, and how access is approved/audited. This template must align with privacy retention rules and privileged access policy.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- Privacy retention/deletion: {{xref:PRIV-05}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Retention classes list (s | spec         | No              |
| Retention days per class  | spec         | No              |
| Access roles allowed (who | spec         | No              |
| Export rules (who can exp | spec         | No              |
| Search/query access polic | spec         | No              |
| Redaction rules for audit | spec         | No              |
| Break-glass access rules  | spec         | No              |
| Audit-of-audit requiremen | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Legal hold interaction ru | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Audit logs should be retained long enough for security investigations and compliance, but must
- respect privacy constraints.
- Viewing/export access must be least privilege and auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Search & Query Spec (filters, exports, APIs)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:AUDIT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-06}}, {{xref:AUDIT-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, approval rule, exporter roles, break rule,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If retention.classes is UNKNOWN → block Completeness Gate.
- If retention.standard_days is UNKNOWN → block Completeness Gate.
- If access.viewer_roles is UNKNOWN → block Completeness Gate.
- If view.masking_rule is UNKNOWN → block Completeness Gate.
- If telemetry.view_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] retention_defined == true
- [ ] access_controls_defined == true
- [ ] masking_defined == true
- [ ] audit_of_audit_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-06
