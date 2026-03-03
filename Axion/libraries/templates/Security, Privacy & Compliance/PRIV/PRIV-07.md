# PRIV-07 — Consent Management Spec (collection, storage, withdrawal)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-07                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring consent management spec ( |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-02, PRIV-03, SEC-07                         |
| Produces          | Filled Consent Management Spec (collection, stora|

## 2. Purpose

Define the canonical privacy-by-design checklist used in design/dev/release gates: minimization, consent, retention, sharing, and logging redaction expectations. This template must align with the privacy models and Secure SDLC gates.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Minimization rules: {{xref:PRIV-03}} | OPTIONAL
- Secure SDLC policy: {{xref:SEC-07}} | OPTIONAL
- Compliance controls: {{xref:COMP-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Checklist registry (check | spec         | No              |
| Check categories (collect | spec         | No              |
| Checklist items per categ | spec         | No              |
| Required review points (d | spec         | No              |
| Evidence requirement (wha | spec         | No              |
| Approver roles (privacy/s | spec         | No              |
| Exception handling ref (C | spec         | No              |
| Telemetry requirements (c | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| DPIA trigger rules        | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Checklist items must be actionable and testable.
- Exceptions must be time-bound and approved.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Consent Management Spec (collection, storage, withdrawal)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRIV-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-09}}, {{xref:PRIV-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, approver roles, workflow, exceptions ref,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If checks[].check_id is UNKNOWN → block Completeness Gate.
- If checks[].statement is UNKNOWN → block Completeness Gate.
- If checks[*].evidence is UNKNOWN → block Completeness Gate.
- If telemetry.completed_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PRIV
- Pass conditions:
- [ ] required_fields_present == true
- [ ] checklist_defined == true
- [ ] evidence_defined == true
- [ ] review_points_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PRIV-08
