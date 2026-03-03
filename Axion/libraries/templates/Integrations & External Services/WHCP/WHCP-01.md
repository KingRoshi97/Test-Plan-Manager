# WHCP-01 — Webhook Catalog (inbound + outbound by event type)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-01                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring webhook catalog (inbound  |
| Filled By         | Internal Agent                                   |
| Consumes          | EVT-01, IXS-01                                   |
| Produces          | Filled Webhook Catalog (inbound + outbound by eve|

## 2. Purpose

Create the canonical catalog of webhook events (inbound and outbound), indexed by webhook_id and/or event_id, including producers/consumers, payload schema references, security requirements, and delivery semantics pointers. This template must not invent webhook IDs or event IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}} | OPTIONAL
- EVT-02 Event Schema Spec: {{evt.schemas}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- ROUTE-03 Deep Link Map (if webhooks trigger links): {{route.deep_link_map}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Webhook registry (webhook | spec         | No              |
| webhook_id (stable identi | spec         | No              |
| direction (inbound/outbou | spec         | No              |
| event_id binding (if appl | spec         | No              |
| name/purpose              | spec         | No              |
| producer (system/service) | spec         | No              |
| consumer (system/service) | spec         | No              |
| payload schema ref (EVT-0 | spec         | No              |
| delivery semantics ref (W | spec         | No              |
| security policy ref (WHCP | spec         | No              |
| retry/dedupe policy ref ( | spec         | No              |
| environments enabled (dev | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Subscription/endpoint reg | spec         | Enrichment only, no new truth  |
| PII flags                 | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent webhook_id/event_id; use only upstream catalogs when present.
- Every webhook entry MUST reference schema + security + delivery semantics (or approved
- UNKNOWN).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Webhook Catalog (inbound + outbound by event type)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:EVT-01}} | OPTIONAL, {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:WHCP-02}}, {{xref:WHCP-03}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, event_id, registration ref, pii flags,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If items[].webhook_id is UNKNOWN → block Completeness Gate.
- If items[].schema_ref is UNKNOWN → block Completeness Gate.
- If items[].security_ref is UNKNOWN → block Completeness Gate.
- If items[].delivery_semantics_ref is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] webhook_ids_unique == true
- [ ] schema_security_delivery_refs_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-02
