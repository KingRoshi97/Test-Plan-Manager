# AUDIT-02 — Audit Log Schema (fields, formats, immutability rules)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-02                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit log schema (fields, |
| Filled By         | Internal Agent                                   |
| Consumes          | AUDIT-01, SEC-02, CER-05                         |
| Produces          | Filled Audit Log Schema (fields, formats, immutab|

## 2. Purpose

Define the canonical schema for audit events: required fields, correlation identifiers, actor/target structure, and redaction rules. This schema is used by capture rules, storage, and investigation tooling.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Logging/redaction: {{xref:CER-05}} | OPTIONAL
- Canonical schemas: {{xref:DATA-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Schema version (semver)   | spec         | No              |
| Required top-level fields | spec         | No              |
| Actor schema (type/id/rol | spec         | No              |
| Target schema (resource_t | spec         | No              |
| Request context fields (i | spec         | No              |
| Correlation IDs (request_ | spec         | No              |
| Reason code field (deny r | spec         | No              |
| PII redaction rules (what | spec         | No              |
| Extensibility rule (event | spec         | No              |
| Telemetry requirements (s | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Example audit event       | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never include tokens/secrets or full content bodies in audit payloads.
- Correlation IDs must be present for all events generated from API requests where possible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Log Schema (fields, formats, immutability rules)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:AUDIT-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-03}}, {{xref:AUDIT-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, actor types, hashing rules, reason
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If schema.version is UNKNOWN → block Completeness Gate.
- If schema.required_fields is UNKNOWN → block Completeness Gate.
- If corr.fields is UNKNOWN → block Completeness Gate.
- If redact.denylist_fields is UNKNOWN → block Completeness Gate.
- If telemetry.validation_fail_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] schema_defined == true
- [ ] correlation_defined == true
- [ ] redaction_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-03
