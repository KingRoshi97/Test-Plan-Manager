# AUDIT-01 — Audit Event Catalog (by event_type, severity)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-01                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit event catalog (by e |
| Filled By         | Internal Agent                                   |
| Consumes          | ADMIN-03, API-01, IAM-04                         |
| Produces          | Filled Audit Event Catalog (by event_type, severi|

## 2. Purpose

Create the canonical catalog of audit events that must be recorded across the system, indexed by event_type. This catalog drives schema requirements, capture rules, alerts, and forensics workflows. It must align with privileged actions, financial actions, and sensitive data access.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit trail spec (admin): {{xref:ADMIN-03}} | OPTIONAL
- API surface: {{xref:API-01}} | OPTIONAL
- AuthZ enforcement points: {{xref:IAM-04}} | OPTIONAL
- Payments ledger: {{xref:PAY-07}} | OPTIONAL
- File access control: {{xref:FMS-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Event type registry (even | spec         | No              |
| event_type (stable identi | spec         | No              |
| Category (auth/authz/admi | spec         | No              |
| Triggering action (what c | spec         | No              |
| Actor (user/service/admin | spec         | No              |
| Target (resource type/id) | spec         | No              |
| Minimum required fields ( | spec         | No              |
| Retention class (short/st | spec         | No              |
| Sensitivity level (contai | spec         | No              |
| Downstream consumers (ale | spec         | No              |
| Telemetry requirements (e | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Example payload           | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Every audit event type must be tied to a triggering action and capture at least actor+target.
- Do not include raw secret material or full content bodies in audit payloads.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Event Catalog (by event_type, severity)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:ADMIN-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-02}}, {{xref:AUDIT-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, example payloads, consumers,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If events[].event_type is UNKNOWN → block Completeness Gate.
- If events[].trigger is UNKNOWN → block Completeness Gate.
- If events[].required_fields is UNKNOWN → block Completeness Gate.
- If events[].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] event_registry_defined == true
- [ ] triggers_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-02
