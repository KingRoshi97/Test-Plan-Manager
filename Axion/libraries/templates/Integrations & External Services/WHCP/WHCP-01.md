# WHCP-01 — Webhook Event Catalog (by webhook_id/event_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-01                                             |
| Template Type     | Integration / Webhooks                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring webhook event catalog (by webhook_id/event_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Webhook Event Catalog (by webhook_id/event_id) Document                         |

## 2. Purpose

Create the canonical catalog of webhook events (inbound and outbound), indexed by
webhook_id and/or event_id, including producers/consumers, payload schema references,
security requirements, and delivery semantics pointers. This template must not invent webhook
IDs or event IDs beyond upstream inputs.

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

Webhook registry (webhook_id list)
webhook_id (stable identifier)
direction (inbound/outbound)
event_id binding (if applicable)
name/purpose
producer (system/service)
consumer (system/service)
payload schema ref (EVT-02 / WHCP-09)
delivery semantics ref (WHCP-04)
security policy ref (WHCP-05)
retry/dedupe policy ref (WHCP-04/WHCP-02/03)
environments enabled (dev/stage/prod)

Optional Fields
Subscription/endpoint registration ref (WHCP-06) | OPTIONAL
PII flags | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not invent webhook_id/event_id; use only upstream catalogs when present.
Every webhook entry MUST reference schema + security + delivery semantics (or approved
UNKNOWN).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Catalog Summary
total_webhooks: {{catalog.total}}
inbound_count: {{catalog.inbound_count}} | OPTIONAL
outbound_count: {{catalog.outbound_count}} | OPTIONAL
2. Webhook Entries (by webhook_id)
Webhook
webhook_id: {{items[0].webhook_id}}
direction: {{items[0].direction}}
event_id: {{items[0].event_id}} | OPTIONAL
name: {{items[0].name}}
purpose: {{items[0].purpose}}
producer: {{items[0].producer}}
consumer: {{items[0].consumer}}
schema_ref: {{items[0].schema_ref}}
delivery_semantics_ref: {{items[0].delivery_semantics_ref}} (expected:
{{xref:WHCP-04}})
security_ref: {{items[0].security_ref}} (expected: {{xref:WHCP-05}})
retry_dedupe_ref: {{items[0].retry_dedupe_ref}} (expected:
{{xref:WHCP-02}}/{{xref:WHCP-03}}/{{xref:WHCP-04}})
env_enabled: {{items[0].env_enabled}}
registration_ref: {{items[0].registration_ref}} | OPTIONAL
pii_flags: {{items[0].pii_flags}} | OPTIONAL
open_questions:
{{items[0].open_questions[0]}} | OPTIONAL

(Repeat per webhook_id.)

3. References
Outbound producer spec: {{xref:WHCP-02}} | OPTIONAL
Inbound consumer spec: {{xref:WHCP-03}} | OPTIONAL
Delivery semantics: {{xref:WHCP-04}} | OPTIONAL
Security rules: {{xref:WHCP-05}} | OPTIONAL
Endpoint registration: {{xref:WHCP-06}} | OPTIONAL
Failure handling: {{xref:WHCP-07}} | OPTIONAL
Observability: {{xref:WHCP-08}} | OPTIONAL
Versioning: {{xref:WHCP-09}} | OPTIONAL
Testing/sandbox: {{xref:WHCP-10}} | OPTIONAL

Cross-References
Upstream: {{xref:EVT-01}} | OPTIONAL, {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:WHCP-02}}, {{xref:WHCP-03}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Populate webhook registry and core fields; do not invent IDs.
intermediate: Required. Add schema/security/delivery refs and retry/dedupe linkage.
advanced: Required. Add env enablement rigor, registration refs, and PII flags/traceability.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, event_id, registration ref, pii flags,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If items[].webhook_id is UNKNOWN → block Completeness Gate.
If items[].schema_ref is UNKNOWN → block Completeness Gate.
If items[].security_ref is UNKNOWN → block Completeness Gate.
If items[].delivery_semantics_ref is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
webhook_ids_unique == true
schema_security_delivery_refs_present == true
placeholder_resolution == true
no_unapproved_unknowns == true

WHCP-02

WHCP-02 — Outbound Webhook Producer Spec (signing, retries, dedupe)
Header Block

## 5. Optional Fields

Subscription/endpoint registration ref (WHCP-06) | OPTIONAL
PII flags | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent webhook_id/event_id; use only upstream catalogs when present.
- **Every webhook entry MUST reference schema + security + delivery semantics (or approved**
- **UNKNOWN).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Catalog Summary`
2. `## Webhook Entries (by webhook_id)`
3. `## Webhook`
4. `## open_questions:`
5. `## (Repeat per webhook_id.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:EVT-01}} | OPTIONAL, {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:WHCP-02}}, {{xref:WHCP-03}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
