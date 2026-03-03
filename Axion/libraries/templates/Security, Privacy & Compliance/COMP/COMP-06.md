# COMP-06 — Remediation Plan (per gap: owner, deadline, status)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-06                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring remediation plan (per gap |
| Filled By         | Internal Agent                                   |
| Consumes          | COMP-01, PRIV-02, PAY-09, NOTIF-04               |
| Produces          | Filled Remediation Plan (per gap: owner, deadline|

## 2. Purpose

Define the canonical list of applicable regulatory requirements and what the system must do to comply (at a requirements level). This template must not claim certifications, and must link requirements to the relevant system policies (payments, notifications, retention, audit).

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Payments security: {{xref:PAY-09}} | OPTIONAL
- Notification send policy: {{xref:NOTIF-04}} | OPTIONAL
- Audit retention/access: {{xref:AUDIT-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Regulation registry (reg_ | spec         | No              |
| reg_id (stable identifier | spec         | No              |
| Regulation/framework name | spec         | No              |
| Applicability statement ( | spec         | No              |
| System requirements list  | spec         | No              |
| Evidence expectations (wh | spec         | No              |
| Owner (who ensures)       | spec         | No              |
| Review cadence            | spec         | No              |
| Telemetry requirements (v | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Jurisdiction scope notes  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Do not claim “compliant” unless proven; describe “requirements” only.
- Each regulation entry must map to at least one system policy/doc reference.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Remediation Plan (per gap: owner, deadline, status)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-02}}, {{xref:COMP-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, jurisdiction notes, open_questions
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If regs[].reg_id is UNKNOWN → block Completeness Gate.
- If regs[].requirements is UNKNOWN → block Completeness Gate.
- If regs[].evidence is UNKNOWN → block Completeness Gate.
- If regs[].owner is UNKNOWN → block Completeness Gate.
- If regs[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] reg_registry_defined == true
- [ ] requirements_and_evidence_defined == true
- [ ] owners_and_cadence_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] COMP-07
