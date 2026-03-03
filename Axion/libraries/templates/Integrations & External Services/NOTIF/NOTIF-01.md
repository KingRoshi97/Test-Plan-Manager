# NOTIF-01 — Notification Channel Inventory (email, SMS, push, in-app)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-01                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring notification channel inve |
| Filled By         | Internal Agent                                   |
| Consumes          | MPUSH-01, IXS-01                                 |
| Produces          | Filled Notification Channel Inventory (email, SMS|

## 2. Purpose

Create the single, canonical inventory of notification channels used by the product (email/SMS/push/in-app), including what each channel is used for, constraints, and which downstream templates govern each channel. This document must not invent channel types beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}} | OPTIONAL
- MPUSH-02 Push Payload Contract: {{mpush.payload_contract}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Channel registry (channel | spec         | No              |
| channel_id (email/sms/pus | spec         | No              |
| channel purpose (what it’ | spec         | No              |
| supported message types ( | spec         | No              |
| delivery constraints (max | spec         | No              |
| PII/compliance constraint | spec         | No              |
| quiet hours applicability | spec         | No              |
| opt-out model (global/per | spec         | No              |
| provider dependency (prov | spec         | No              |
| telemetry requirements (s | spec         | No              |
| references to channel-spe | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Fallback channel rules    | spec         | Enrichment only, no new truth  |
| Regional restrictions     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent channel_ids; use the allowed set {email, sms, push, in_app}.
- Each channel must define opt-out + consent handling for message types that require it.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Notification Channel Inventory (email, SMS, push, in-app)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-02}}, {{xref:NOTIF-04}}, {{xref:NOTIF-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, provider refs, optional
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If channels[].channel_id is UNKNOWN → block Completeness Gate.
- If channels[].opt_out_model is UNKNOWN → block Completeness Gate.
- If channels[].telemetry.send_metric is UNKNOWN → block Completeness Gate.
- If channels[].spec_refs is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] channel_ids_valid == true
- [ ] opt_out_models_defined == true
- [ ] telemetry_defined == true
- [ ] spec_refs_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-02
