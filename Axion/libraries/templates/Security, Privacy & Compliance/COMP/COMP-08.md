# COMP-08 — Compliance Reporting Spec (dashboards, executive reports)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-08                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring compliance reporting spec |
| Filled By         | Internal Agent                                   |
| Consumes          | SEC-08, COMP-02                                  |
| Produces          | Filled Compliance Reporting Spec (dashboards, exe|

## 2. Purpose

Define the canonical process for compliance exceptions/waivers: request, approval, expiry, review, and audit logging. This template coordinates with security exceptions but covers compliance control deviations broadly.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security exceptions process: {{xref:SEC-08}} | OPTIONAL
- Control matrix: {{xref:COMP-02}} | OPTIONAL
- Privileged audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Exception request schema  | spec         | No              |
| Approval roles (complianc | spec         | No              |
| Expiry requirement (max d | spec         | No              |
| Compensating controls req | spec         | No              |
| Evidence requirement (why | spec         | No              |
| Review cadence (re-approv | spec         | No              |
| Revocation process        | spec         | No              |
| Tracking system/location  | spec         | No              |
| Audit logging requirement | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Emergency waivers process | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- No waivers without expiry and documented risk.
- Approvals and evidence must be recorded and auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Compliance Reporting Spec (dashboards, executive reports)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:COMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, workflow, renewal policy, doc rule,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If schema.fields_required is UNKNOWN → block Completeness Gate.
- If approve.roles is UNKNOWN → block Completeness Gate.
- If expiry.max_duration_days is UNKNOWN → block Completeness Gate.
- If revoke.process is UNKNOWN → block Completeness Gate.
- If telemetry.active_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] approvals_and_expiry_defined == true
- [ ] evidence_and_reviews_defined == true
- [ ] audit_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] COMP-09
