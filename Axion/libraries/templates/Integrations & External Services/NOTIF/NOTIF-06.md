# NOTIF-06 — Personalization & Localization Rules (i18n, dynamic content)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-06                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring personalization & localiz |
| Filled By         | Internal Agent                                   |
| Consumes          | NOTIF-01, NOTIF-03, ROUTE-01                     |
| Produces          | Filled Personalization & Localization Rules (i18n|

## 2. Purpose

Define the canonical preference center model and opt-out rules: how users control notification settings globally and per-type, how consent is recorded, and how opt-outs are enforced across channels/providers. This template must be consistent with send policy and deliverability suppression rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-03 Template/Notification Mapping: {{notif.template_mapping}} | OPTIONAL
- FE-01 Route Map/Layout: {{fe.routes}} | OPTIONAL
- ROUTE-01 Route Contract: {{route.contract}} | OPTIONAL
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Preference model (global  | spec         | No              |
| Preference entity fields  | spec         | No              |
| Default opt-in states (pe | spec         | No              |
| Opt-out enforcement rules | spec         | No              |
| Unsubscribe link behavior | spec         | No              |
| Channel-specific opt-out  | spec         | No              |
| Transactional vs marketin | spec         | No              |
| Consent capture rules (wh | spec         | No              |
| Data retention for prefer | spec         | No              |
| Telemetry requirements (o | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-tenant preference ove | spec         | Enrichment only, no new truth  |
| Double opt-in policy      | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Opt-out must be enforced server-side at send time.
- Consent must be explicit where required; do not default opt-in for marketing unless allowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Personalization & Localization Rules (i18n, dynamic content)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-07}}, {{xref:NOTIF-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, storage location, suppression interaction,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If prefs.default_states is UNKNOWN → block Completeness Gate.
- If enforce.at_send_time is UNKNOWN → block Completeness Gate.
- If unsub.email_rule is UNKNOWN → block Completeness Gate.
- If retention.policy is UNKNOWN → block Completeness Gate.
- If telemetry.preference_change_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] defaults_defined == true
- [ ] unsubscribe_defined == true
- [ ] enforcement_defined == true
- [ ] consent_and_retention_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-07
