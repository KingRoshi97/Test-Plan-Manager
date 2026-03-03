# PRIV-09 — Privacy Observability (consent metrics, DSAR SLAs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-09                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring privacy observability (co |
| Filled By         | Internal Agent                                   |
| Consumes          | SEC-05, PRIV-02, COMP-06                         |
| Produces          | Filled Privacy Observability (consent metrics, DS|

## 2. Purpose

Define the canonical handling of privacy incidents (PII exposure, unauthorized access): triage, containment, assessment, notification triggers, and post-incident actions. This template must align with security incident response and regulatory requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Incident response plan: {{xref:SEC-05}} | OPTIONAL
- PII classification model: {{xref:PRIV-02}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Privacy incident types li | spec         | No              |
| Severity model (privacy-s | spec         | No              |
| Triage process (who asses | spec         | No              |
| Containment actions (disa | spec         | No              |
| Assessment rule (what dat | spec         | No              |
| Notification trigger rule | spec         | No              |
| Timeline rules (if known, | spec         | No              |
| Evidence preservation rul | spec         | No              |
| Post-incident remediation | spec         | No              |
| Telemetry requirements (i | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Customer comms templates  | spec         | Enrichment only, no new truth  |
| Vendor coordination rules | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not claim notification timelines unless explicitly defined; use UNKNOWN where needed.
- Assessment must identify impacted data classes and counts where possible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Privacy Observability (consent metrics, DSAR SLAs)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PRIV-10}}, {{xref:COMP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, regulator trigger, timeline,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If types.list is UNKNOWN → block Completeness Gate.
- If triage.steps is UNKNOWN → block Completeness Gate.
- If assess.rule is UNKNOWN → block Completeness Gate.
- If telemetry.incident_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PRIV
- Pass conditions:
- [ ] required_fields_present == true
- [ ] types_and_triage_defined == true
- [ ] containment_and_assessment_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PRIV-10
