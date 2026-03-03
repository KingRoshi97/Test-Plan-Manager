# MPUSH-02 — Payload Schema (structure, size, platform rules)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-02                                         |
| Template Type     | Build / Push Notifications                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring payload schema (structure |
| Filled By         | Internal Agent                                   |
| Consumes          | MPUSH-01, MDL-02, CSec-05                        |
| Produces          | Filled Payload Schema (structure, size, platform |

## 2. Purpose

Define the canonical push notification payload contract: required and optional fields, routing fields to link notifications to in-app screens/actions, localization key requirements, and security constraints. This template must be consistent with notification type catalog and deep link safety rules and must not invent payload fields not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}}
- MDL-02 Routing Rules: {{mobile.routing_rules}} | OPTIONAL
- CSec-05 Secure Deep Link Handling: {{csec.deep_link_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Required payload fields ( | spec         | No              |
| Optional payload fields ( | spec         | No              |
| Routing contract fields ( | spec         | No              |
| Localization keys contrac | spec         | No              |
| Versioning rules (payload | spec         | No              |
| Security constraints (no  | spec         | No              |
| Validation rules (reject  | spec         | No              |
| Max payload size policy   | spec         | No              |
| Telemetry fields (deliver | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Platform-specific fields  | spec         | Enrichment only, no new truth  |
| Encrypted payload section | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- No sensitive data in payload.
- Routing targets MUST be allowlisted per deep link rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Payload Schema (structure, size, platform rules)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:MPUSH-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:MPUSH-04}}, {{xref:MPUSH-05}} | OPTIONAL
- Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, compat policy, delivery id, optional fields,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If schema.version is UNKNOWN → block Completeness Gate.
- If fields.required.notif_id is UNKNOWN → block Completeness Gate.
- If routing.validation_rule is UNKNOWN → block Completeness Gate.
- If security.no_pii_rule is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MPUSH
- Pass conditions:
- [ ] required_fields_present == true
- [ ] payload_contract_defined == true
- [ ] routing_validation_defined == true
- [ ] security_constraints_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] MPUSH-03
