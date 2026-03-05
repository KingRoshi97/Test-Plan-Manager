# IXS-04 — Secrets & Credential Handling (storage, rotation, access)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-04                                             |
| Template Type     | Integration / External Systems                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring secrets & credential handling (storage, rotation, access)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Secrets & Credential Handling (storage, rotation, access) Document                         |

## 2. Purpose

Define the canonical policy for handling secrets and credentials used by integrations: where
they are stored, how they are accessed, rotation schedules, least-privilege access controls, and
compromise response. This template must be consistent with security and audit policies and
must not expose secret material.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- IXS-02 Integration Specs: {{ixs.integration_specs}} | OPTIONAL
- SIGN-02 Signing Keys & Rotation Policy: {{sign.keys_policy}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Credential inventory (credential_id list)
credential_id (stable identifier)
integration_id binding (must exist)
credential type (api_key/oauth_client/secret/webhook_secret/cert/UNKNOWN)
storage location policy (secret manager/ci vault/env/UNKNOWN)
access control policy (who/what can read)
rotation policy (schedule + triggers)
revocation/compromise response steps
logging/redaction rules (never log secrets)
environment scoping (dev/stage/prod separation)
secret distribution method (runtime fetch vs build-time inject)
audit logging requirements (access/use events)

Optional Fields
Key ceremony notes | OPTIONAL
mTLS/cert chain notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never include secret values in this document.
Credentials MUST be scoped per environment unless explicitly justified.
Access MUST follow least privilege and be auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Credential Inventory Summary
total_credentials: {{inv.total}}
types_present: {{inv.types_present}} | OPTIONAL
notes: {{inv.notes}} | OPTIONAL
2. Credential Entries (by credential_id)
Credential
credential_id: {{creds[0].credential_id}}
integration_id: {{creds[0].integration_id}}
type: {{creds[0].type}}
env_scope: {{creds[0].env_scope}}
storage_location: {{creds[0].storage_location}}
distribution_method: {{creds[0].distribution_method}}
(runtime_fetch/build_inject/UNKNOWN)
access_policy: {{creds[0].access_policy}}
rotation_schedule: {{creds[0].rotation_schedule}}
rotation_triggers: {{creds[0].rotation_triggers}} | OPTIONAL
revocation_steps: {{creds[0].revocation_steps}}
audit_required: {{creds[0].audit_required}}
redaction_rule: {{creds[0].redaction_rule}}
notes: {{creds[0].notes}} | OPTIONAL
open_questions:
{{creds[0].open_questions[0]}} | OPTIONAL
(Repeat per credential_id.)
3. Global Rules
no_secret_in_logs_rule: {{global.no_secret_in_logs_rule}}
no_secret_in_repo_rule: {{global.no_secret_in_repo_rule}}
separation_of_envs_rule: {{global.separation_of_envs_rule}}

4. Compromise Response
detection_signals: {{compromise.detection_signals}} | OPTIONAL
response_steps: {{compromise.response_steps}}
notification_policy: {{compromise.notification_policy}} | OPTIONAL
5. Audit Logging
audit_fields: {{audit.fields}}
audit_retention_policy: {{audit.retention_policy}} | OPTIONAL
6. References
Integration inventory: {{xref:IXS-01}}
Integration specs: {{xref:IXS-02}} | OPTIONAL
Audit trail: {{xref:ADMIN-03}} | OPTIONAL
Signing/rotation baseline: {{xref:SIGN-02}} | OPTIONAL
Cross-References
Upstream: {{xref:IXS-01}}, {{xref:IXS-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-08}}, {{xref:IXS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. List credentials and storage locations; use UNKNOWN for rotation triggers
if not provided; do not invent.
intermediate: Required. Add access policies, env scoping, distribution method, and audit
requirements.
advanced: Required. Add compromise response rigor and rotation procedures aligned to org
security.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, types present, rotation
triggers, detection signals, notification policy, retention policy, key/cert notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If creds[].credential_id is UNKNOWN → block Completeness Gate.
If creds[].storage_location is UNKNOWN → block Completeness Gate.
If global.no_secret_in_repo_rule is UNKNOWN → block Completeness Gate.
If creds[*].revocation_steps is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:
required_fields_present == true
credential_ids_unique == true
integration_ids_exist_in_inventory == true
storage_and_access_defined == true
no_secret_exposure_rules_defined == true

audit_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

IXS-05

IXS-05 — Data Mapping & Transformation Rules (field maps, normalization)
Header Block

## 5. Optional Fields

Key ceremony notes | OPTIONAL
mTLS/cert chain notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never include secret values in this document.**
- **Credentials MUST be scoped per environment unless explicitly justified.**
- **Access MUST follow least privilege and be auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Credential Inventory Summary`
2. `## Credential Entries (by credential_id)`
3. `## Credential`
4. `## (runtime_fetch/build_inject/UNKNOWN)`
5. `## open_questions:`
6. `## (Repeat per credential_id.)`
7. `## Global Rules`
8. `## Compromise Response`
9. `## Audit Logging`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}}, {{xref:IXS-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IXS-08}}, {{xref:IXS-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
