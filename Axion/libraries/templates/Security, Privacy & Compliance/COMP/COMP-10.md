# COMP-10 — Regulatory Change Management (tracking, impact assessment)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-10                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring regulatory change managem |
| Filled By         | Internal Agent                                   |
| Consumes          | COMP-02, COMP-09, PRIV-10                        |
| Produces          | Filled Regulatory Change Management (tracking, im|

## 2. Purpose

Define the canonical compliance reporting and audit execution process: internal audit cadence, external audit readiness, what reports are produced, and how evidence is packaged and delivered. This template must align with evidence collection plans and investigation workflows.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Control matrix: {{xref:COMP-02}} | OPTIONAL
- Evidence collection plan: {{xref:COMP-09}} | OPTIONAL
- Privacy metrics/audits: {{xref:PRIV-10}} | OPTIONAL
- Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Reporting types list (int | spec         | No              |
| Cadence (quarterly/annual | spec         | No              |
| Owners (who prepares)     | spec         | No              |
| Evidence packaging proces | spec         | No              |
| Audit request intake work | spec         | No              |
| Scope confirmation proces | spec         | No              |
| Findings tracking process | spec         | No              |
| Communication rules (who  | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Auditor access rules      | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Reports must be based on evidence artifacts, not statements.
- Findings must be tracked to closure with owners and due dates.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Regulatory Change Management (tracking, impact assessment)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:COMP-09}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SEC-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, packaging location, scope confirm rule,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If report.types is UNKNOWN → block Completeness Gate.
- If cadence.value is UNKNOWN → block Completeness Gate.
- If findings.system is UNKNOWN → block Completeness Gate.
- If telemetry.completed_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] reporting_and_cadence_defined == true
- [ ] evidence_packaging_defined == true
- [ ] findings_tracking_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
