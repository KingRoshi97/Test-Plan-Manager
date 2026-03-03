# MPUSH-01 — Push Notification Catalog (by notification_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-01                                         |
| Template Type     | Build / Push Notifications                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring push notification catalog |
| Filled By         | Internal Agent                                   |
| Consumes          | SPEC_INDEX, ROUTE-03                             |
| Produces          | Filled Push Notification Catalog (by notification|

## 2. Purpose

Create the canonical catalog of push notification types, indexed by notif_id, including purpose, triggering events, targeting rules, payload shape reference, and deep link behavior. This template must be consistent with routing/deep links and must not invent notif_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-03 Deep Link Map: {{route.deep_link_map}} | OPTIONAL
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Notification type registr | spec         | No              |
| notif_id (stable identifi | spec         | No              |
| name (human-readable)     | spec         | No              |
| purpose (why it exists)   | spec         | No              |
| trigger source (event_id/ | spec         | No              |
| targeting rules (who rece | spec         | No              |
| priority level (low/norma | spec         | No              |
| delivery channel (push)   | spec         | No              |
| deep link behavior (link_ | spec         | No              |
| user-facing copy keys (lo | spec         | No              |
| disable/opt-out support ( | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Quiet hours applicability | spec         | Enrichment only, no new truth  |
| Collapse/grouping key     | spec         | Enrichment only, no new truth  |
| Sensitive content rules   | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent notif_ids; use only {{spec.notifications_by_id}} if present, else mark UNKNOWN
- and flag.
- Deep link targets MUST be allowlisted ({{xref:ROUTE-03}}/{{xref:MDL-02}}).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Push Notification Catalog (by notification_id)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:ROUTE-03}} | OPTIONAL
- **Downstream**: {{xref:MPUSH-02}}, {{xref:MPUSH-05}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, catalog summary extras, quiet hours,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If notif registry is UNKNOWN → block Completeness Gate.
- If items[].priority is UNKNOWN → block Completeness Gate.
- If items[].copy_keys.title_key/body_key are UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MPUSH
- Pass conditions:
- [ ] required_fields_present == true
- [ ] notif_registry_defined == true
- [ ] deep_links_allowlisted == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] MPUSH-02
