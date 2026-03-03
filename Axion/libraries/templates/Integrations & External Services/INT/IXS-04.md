# IXS-04 — Data Mapping & Transformation

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-04                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring data mapping & transforma |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, IXS-02, SIGN-02                          |
| Produces          | Filled Data Mapping & Transformation             |

## 2. Purpose

Define the canonical policy for handling secrets and credentials used by integrations: where they are stored, how they are accessed, rotation schedules, least-privilege access controls, and compromise response. This template must be consistent with security and audit policies and must not expose secret material.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-01 Integration Inventory: `{{ixs.inventory}}`
- IXS-02 Integration Specs: `{{ixs.integration_specs}}` | OPTIONAL
- SIGN-02 Signing Keys & Rotation Policy: `{{sign.keys_policy}}` | OPTIONAL
- ADMIN-03 Audit Trail Spec: `{{admin.audit_trail}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Credential inventory | credential_id list |
| credential_id | Stable identifier |
| integration_id binding | Must exist |
| credential type | api_key/oauth_client/secret/webhook_secret/cert/UNKNOWN |
| storage location policy | Secret manager/ci vault/env/UNKNOWN |
| access control policy | Who/what can read |
| rotation policy | Schedule + triggers |
| revocation/compromise response steps | Response procedure |
| logging/redaction rules | Never log secrets |
| environment scoping | dev/stage/prod separation |
| secret distribution method | Runtime fetch vs build-time inject |
| audit logging requirements | Access/use events |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Key ceremony notes | OPTIONAL |
| mTLS/cert chain notes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Never include secret values in this document.
- Credentials MUST be scoped per environment unless explicitly justified.
- Access MUST follow least privilege and be auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-01}}`, `{{xref:IXS-02}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IXS-08}}`, `{{xref:IXS-10}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-PII-REDACTION]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. List credentials and storage locations; use UNKNOWN for rotation triggers if not provided; do not invent.
- **intermediate**: Required. Add access policies, env scoping, distribution method, and audit requirements.
- **advanced**: Required. Add compromise response rigor and rotation procedures aligned to org security.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, inv notes, types present, rotation triggers, detection signals, notification policy, retention policy, key/cert notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `creds[].credential_id` is UNKNOWN → block Completeness Gate.
- If `creds[].storage_location` is UNKNOWN → block Completeness Gate.
- If `global.no_secret_in_repo_rule` is UNKNOWN → block Completeness Gate.
- If `creds[*].revocation_steps` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] credential_ids_unique == true
- [ ] integration_ids_exist_in_inventory == true
- [ ] storage_and_access_defined == true
- [ ] no_secret_exposure_rules_defined == true
- [ ] audit_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

