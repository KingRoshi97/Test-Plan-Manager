# AUDIT-06 — Tamper Detection & Integrity (hashing, signing, alerting)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-06                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring tamper detection & integr |
| Filled By         | Internal Agent                                   |
| Consumes          | AUDIT-05, SEC-05, AUDIT-10                       |
| Produces          | Filled Tamper Detection & Integrity (hashing, sig|

## 2. Purpose

Define the canonical workflow for investigating security/privacy incidents using audit logs: who can query, how queries are recorded, how evidence is exported, and how chain-of-custody is maintained. This template must align with incident response plans and audit access controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit retention/access: {{xref:AUDIT-05}} | OPTIONAL
- Incident response: {{xref:SEC-05}} | OPTIONAL
- Forensics runbooks: {{xref:AUDIT-10}} | OPTIONAL
- Support tools: {{xref:ADMIN-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Investigation roles (who  | spec         | No              |
| Case/ticket model (case_i | spec         | No              |
| Query rules (how to query | spec         | No              |
| Query logging rule (recor | spec         | No              |
| Export rules (formats, ap | spec         | No              |
| Chain-of-custody rule (ha | spec         | No              |
| Evidence storage rule (wh | spec         | No              |
| Time sync rule (timestamp | spec         | No              |
| Telemetry requirements (i | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Standard query library    | spec         | Enrichment only, no new truth  |
| External counsel handoff  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Investigations must be auditable; queries and exports must be tracked.
- Evidence exports must be integrity-protected (hash/sign).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Tamper Detection & Integrity (hashing, signing, alerting)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:AUDIT-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-09}}, {{xref:SEC-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, approver roles, case fields, log fields,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If roles.investigators is UNKNOWN → block Completeness Gate.
- If query.rule is UNKNOWN → block Completeness Gate.
- If export.formats is UNKNOWN → block Completeness Gate.
- If coc.integrity_rule is UNKNOWN → block Completeness Gate.
- If telemetry.cases_opened_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] roles_and_case_model_defined == true
- [ ] query_and_logging_defined == true
- [ ] exports_and_chain_of_custody_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-07
