# COMP-03 — Evidence Collection Spec (per control: source, frequency)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-03                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring evidence collection spec  |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, PRIV-06, COMP-01                         |
| Produces          | Filled Evidence Collection Spec (per control: sou|

## 2. Purpose

Define the canonical vendor risk management process: how third parties are assessed, approved, monitored, and re-reviewed, including security questionnaires, DPAs, and evidence storage. This template must align with integration inventory and data sharing map.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Integration inventory: {{xref:IXS-01}} | OPTIONAL
- Data sharing map: {{xref:PRIV-06}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- Integration security baseline: {{xref:IXS-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Vendor tiering model (low | spec         | No              |
| Vendors in scope (provide | spec         | No              |
| Pre-engagement review req | spec         | No              |
| DPA requirement rule (whe | spec         | No              |
| Approval roles (security/ | spec         | No              |
| Re-review cadence (annual | spec         | No              |
| Incident notification exp | spec         | No              |
| Evidence storage location | spec         | No              |
| Telemetry requirements (v | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Continuous monitoring app | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- High-risk vendors must have stricter review and DPAs where required.
- Vendor approvals must be recorded and auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Evidence Collection Spec (per control: source, frequency)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-05}}, {{xref:COMP-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, tiering rule, minimum controls, dpa
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If tiers.model is UNKNOWN → block Completeness Gate.
- If vendors.list is UNKNOWN → block Completeness Gate.
- If dpa.required_rule is UNKNOWN → block Completeness Gate.
- If evidence.location is UNKNOWN → block Completeness Gate.
- If telemetry.reviewed_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] tiering_and_vendor_list_defined == true
- [ ] review_and_approval_defined == true
- [ ] evidence_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] COMP-04
