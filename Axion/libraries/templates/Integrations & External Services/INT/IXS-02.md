# IXS-02 — Integration Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-02                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring integration spec          |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, API-01, DATA-06                          |
| Produces          | Filled Integration Spec                          |

## 2. Purpose

- purpose: `{{purpose.statement}}`
- success_definition: `{{purpose.success_definition}}` | OPTIONAL

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-01 Integration Inventory: `{{ixs.inventory}}`
- API-01 Endpoint Catalog: `{{api.endpoint_catalog}}` | OPTIONAL
- API-02 Endpoint Specs: `{{api.endpoint_specs}}` | OPTIONAL
- DATA-06 Canonical Data Schemas: `{{data.schemas}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| integration_id | Must exist in IXS-01 |
| integration name/vendor | Name and vendor |
| purpose statement | Why this integration exists |
| direction | inbound/outbound/bidirectional |
| interfaces used | REST/GraphQL/WS/Webhooks/SFTP/files/SDK |
| data objects exchanged | entity_id/schema_ref list |
| data flow diagram | Text form: source → transform → destination |
| auth method | oauth/api key/signed webhook/saml/oidc/etc. |
| credential location policy ref | IXS-04 |
| rate limit/quotas summary | Or ref |
| error handling policy ref | IXS-06 |
| observability requirements ref | IXS-07 |
| security/compliance notes ref | IXS-08 |
| environments enabled | dev/stage/prod |

## 5. Optional Fields

| Field | Notes |
|---|---|
| SLAs/latency expectations | OPTIONAL |
| Batch vs realtime notes | OPTIONAL |
| Data retention constraints | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- integration_id MUST exist in `{{xref:IXS-01}}`.
- Do not introduce new endpoint_ids or schema_refs; reference existing IDs from `{{xref:API-01}}`/`{{xref:DATA-06}}`.
- Auth must be specific and implementable; do not leave "secure" as a description.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-01}}`, `{{xref:API-01}}` | OPTIONAL, `{{xref:DATA-06}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IXS-09}}`, `{{xref:IXS-10}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Fill identity/purpose/interfaces/flows with UNKNOWN where needed; do not invent IDs.
- **intermediate**: Required. Bind endpoints/schema refs and add auth + error/obs/security refs.
- **advanced**: Required. Add explicit data object lists, rate-limit/SLAs, and traceability pointers.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, category, success definition, endpoint/webhook ids, file transfers, mapping ref, transform rules, auth scopes/claims, credential policy ref, quota enforcement ref, retry behavior, key metrics, pii involved, notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `integration.id` is UNKNOWN → block Completeness Gate.
- If `errors.policy_ref` is UNKNOWN → block Completeness Gate.
- If `obs.ref` is UNKNOWN → block Completeness Gate.
- If `security.ref` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] integration_id_exists_in_inventory == true
- [ ] no new endpoint_ids or schema_refs introduced
- [ ] auth_method_defined == true
- [ ] refs_to_error_obs_security_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

