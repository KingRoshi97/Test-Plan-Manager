# COMP-09 — Compliance Observability (control health, drift alerts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-09                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring compliance observability  |
| Filled By         | Internal Agent                                   |
| Consumes          | COMP-02, SEC-07, AUDIT-04                        |
| Produces          | Filled Compliance Observability (control health, |

## 2. Purpose

Define the canonical plan for collecting and storing compliance evidence artifacts: what artifacts are collected for which controls, how often, who collects them, and where they are stored. This template must align with the control matrix and Secure SDLC evidence outputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Control matrix: {{xref:COMP-02}} | OPTIONAL
- Secure SDLC evidence outputs: {{xref:SEC-07}} | OPTIONAL
- Audit integrity: {{xref:AUDIT-04}} | OPTIONAL
- Privacy metrics/audits: {{xref:PRIV-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Evidence registry (eviden | spec         | No              |
| evidence_id (stable ident | spec         | No              |
| Linked control_id (COMP-0 | spec         | No              |
| Artifact description (wha | spec         | No              |
| Source system/tool (CI, S | spec         | No              |
| Collection cadence        | spec         | No              |
| Owner/collector role      | spec         | No              |
| Storage location (bucket/ | spec         | No              |
| Integrity rule (hash/sign | spec         | No              |
| Access control rule (who  | spec         | No              |
| Telemetry requirements (e | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Automation support notes  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Evidence must be immutable or tamper-evident where feasible.
- Cadence must be enforceable; missed collections must be visible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Compliance Observability (control health, drift alerts)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:COMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, automation notes,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If items[].evidence_id is UNKNOWN → block Completeness Gate.
- If items[].control_id is UNKNOWN → block Completeness Gate.
- If items[].cadence is UNKNOWN → block Completeness Gate.
- If items[].storage_location is UNKNOWN → block Completeness Gate.
- If items[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] evidence_registry_defined == true
- [ ] control_linkage_defined == true
- [ ] cadence_and_storage_defined == true
- [ ] integrity_and_access_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] COMP-10
