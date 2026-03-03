# NOTIF-03 — Routing & Channel Selection Rules (preference, fallback)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-03                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring routing & channel selecti |
| Filled By         | Internal Agent                                   |
| Consumes          | NOTIF-01, NOTIF-02, MPUSH-02                     |
| Produces          | Filled Routing & Channel Selection Rules (prefere|

## 2. Purpose

Define the canonical mapping from notification types to message templates and localization assets: template identifiers per channel/provider, required variables, default language, fallback behavior, and validation rules. This template must be consistent with payload contracts and must not invent template IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- MPUSH-02 Payload Contract (push copy keys): {{mpush.payload_contract}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Template registry (templa | spec         | No              |
| template_id (stable ident | spec         | No              |
| notification type binding | spec         | No              |
| channel binding (email/sm | spec         | No              |
| provider binding (provide | spec         | No              |
| template reference (provi | spec         | No              |
| required variables list   | spec         | No              |
| localization keys (title/ | spec         | No              |
| supported locales list    | spec         | No              |
| fallback locale rule      | spec         | No              |
| missing variable handling | spec         | No              |
| template validation rule  | spec         | No              |
| telemetry requirements (t | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| A/B variant support       | spec         | Enrichment only, no new truth  |
| Per-tenant branding overr | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent template_ids; use upstream registry if present, else mark UNKNOWN and flag.
- Variables must be explicit; no “dynamic” without a list.
- Missing required variables MUST fail or use explicit defaults; no silent blanks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Routing & Channel Selection Rules (preference, fallback)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-04}}, {{xref:NOTIF-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, channels covered, ab variant,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If items[].template_id is UNKNOWN → block Completeness Gate.
- If items[].required_variables is UNKNOWN → block Completeness Gate.
- If items[*].locales.fallback_rule is UNKNOWN → block Completeness Gate.
- If telemetry.render_failure_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] template_ids_unique == true
- [ ] channel_and_provider_bindings_valid == true
- [ ] variable_lists_defined == true
- [ ] localization_fallback_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-04
