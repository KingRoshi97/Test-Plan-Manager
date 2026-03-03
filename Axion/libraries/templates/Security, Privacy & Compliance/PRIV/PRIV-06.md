# PRIV-06 — Data Subject Rights Implementation (DSAR workflow)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-06                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring data subject rights imple |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-01, IXS-01, PAY-01, NOTIF-02                |
| Produces          | Filled Data Subject Rights Implementation (DSAR w|

## 2. Purpose

Legal/consent requirement (PRIV-04 ref) Transmission method (API/webhook/batch) Retention expectations at recipient (if known) Telemetry requirements (sharing events, failures)

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Integration inventory: {{xref:IXS-01}} | OPTIONAL
- Payments providers: {{xref:PAY-01}} | OPTIONAL
- Notification providers: {{xref:NOTIF-02}} | OPTIONAL
- Storage providers: {{xref:FMS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Sharing registry (share_i | spec         | No              |
| share_id (stable identifi | spec         | No              |
| data_class/entity binding | spec         | No              |
| Recipient type (internal_ | spec         | No              |
| Recipient identifier (ser | spec         | No              |
| Data fields shared (minim | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| DPA reference (COMP-05)   | spec         | Enrichment only, no new truth  |
| Regional constraints      | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Share the minimum necessary data; avoid sharing high-tier PII unless required.
- Each external share should have a DPA/record pointer where applicable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Data Subject Rights Implementation (DSAR workflow)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-05}}, {{xref:PRIV-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, consent ref, recipient retention, dpa ref,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If shares[].share_id is UNKNOWN → block Completeness Gate.
- If shares[].fields_shared is UNKNOWN → block Completeness Gate.
- If shares[].purpose is UNKNOWN → block Completeness Gate.
- If shares[].method is UNKNOWN → block Completeness Gate.
- If shares[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PRIV
- Pass conditions:
- [ ] required_fields_present == true
- [ ] share_registry_defined == true
- [ ] fields_and_purposes_defined == true
- [ ] recipients_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PRIV-07
