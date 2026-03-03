# NOTIF-08 — Error Handling & Fallback (undeliverable, bounce)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-08                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring error handling & fallback |
| Filled By         | Internal Agent                                   |
| Consumes          | EVT-01, NOTIF-01, NOTIF-03                       |
| Produces          | Filled Error Handling & Fallback (undeliverable, |

## 2. Purpose

Define the canonical mapping from internal events (event_id) to notification messages (template_id/channel), including eligibility rules, preference enforcement, deduping, and scheduling behavior. This template must be consistent with the event catalog and notification template registry and must not invent event IDs or template IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}}
- EVT-02 Event Schemas: {{evt.schemas}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-03 Template & Localization Mapping: {{notif.templates}}
- FFCFG-01 Feature Flags: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Mapping registry (map_id  | spec         | No              |
| map_id (stable identifier | spec         | No              |
| event_id binding (must ex | spec         | No              |
| notification type binding | spec         | No              |
| channel(s) used           | spec         | No              |
| template_id(s) used       | spec         | No              |
| eligibility rules (who re | spec         | No              |
| preference enforcement ru | spec         | No              |
| dedupe rule (avoid duplic | spec         | No              |
| timing rule (immediate/de | spec         | No              |
| failure handling ref (NOT | spec         | No              |
| telemetry requirements (e | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Feature flag gating       | spec         | Enrichment only, no new truth  |
| Localization override rul | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- event_id MUST exist in {{xref:EVT-01}}; template_id MUST exist in {{xref:NOTIF-03}}.
- Preference enforcement MUST occur before send.
- Dedupe must be deterministic and keyed by event_id + subject.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Error Handling & Fallback (undeliverable, bounce)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:EVT-01}}, {{xref:NOTIF-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-09}}, {{xref:NOTIF-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, preference ref, failure ref,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If maps[].event_id is UNKNOWN → block Completeness Gate.
- If maps[].template_ids is UNKNOWN → block Completeness Gate.
- If maps[*].dedupe_rule is UNKNOWN → block Completeness Gate.
- If telemetry.enqueued_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] event_ids_valid == true
- [ ] template_ids_valid == true
- [ ] dedupe_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-09
