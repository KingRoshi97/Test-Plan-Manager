# IXS-01 — Integration Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-01                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring integration inventory     |
| Filled By         | Internal Agent                                   |
| Consumes          | SPEC_INDEX, DOMAIN_MAP                           |
| Produces          | Filled Integration Inventory                     |

## 2. Purpose

Create the single, canonical inventory of all external integrations used by the application, indexed by integration_id. This inventory defines what systems exist, why they exist, what data moves, and which other integration templates apply. This document must not invent integrations not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Integration registry | integration_id list |
| integration_id | Stable identifier |
| name | Human-readable |
| vendor/system name | Vendor or system |
| integration category | SSO/CRMERP/WHCP/PAY/NOTIF/FMS/other |
| direction | inbound/outbound/bidirectional |
| purpose | Why it exists |
| data domains touched | Domain ids or entity ids |
| auth method summary | api key/oauth/saml/oidc/signed webhook/etc. |
| criticality | low/med/high |
| environments enabled | dev/stage/prod |
| owner | team/role |
| primary risks | PII, financial, availability |
| references to detailed specs | Template refs |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Status (planned/active/deprecated) | OPTIONAL |
| Cost center / billing owner | OPTIONAL |
| Vendor contract/SLA notes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not introduce new integration_ids; use only `{{spec.integrations_by_id}}` if present, else mark UNKNOWN and flag.
- Each integration MUST have at least one "references to detailed specs" entry (or approved UNKNOWN).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:SPEC_INDEX}}` | OPTIONAL, `{{xref:DOMAIN_MAP}}` | OPTIONAL
- **Downstream**: `{{xref:SSO-01}}`, `{{xref:CRMERP-01}}`, `{{xref:WHCP-01}}`, `{{xref:PAY-01}}`, `{{xref:NOTIF-01}}`, `{{xref:FMS-01}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-NAMING]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Populate registry and core fields; use UNKNOWN where inputs are missing; do not invent.
- **intermediate**: Required. Add correct category/direction/auth summaries and spec_refs.
- **advanced**: Required. Add risk notes, ownership clarity, and traceability pointers to domain/entity IDs.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, inv notes, status, cost_center, sla_notes, secondary spec refs, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `items[].integration_id` is UNKNOWN → block Completeness Gate.
- If `items[].spec_refs` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] integration_ids_unique == true
- [ ] no new integration_ids introduced
- [ ] each integration has spec_refs (or approved UNKNOWN)
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

