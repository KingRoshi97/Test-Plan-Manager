# IXS-04 — Secrets & Credential Handling (storage, rotation, access)

## Header Block

| Field | Value |
|---|---|
| template_id | IXS-04 |
| title | Secrets & Credential Handling (storage, rotation, access) |
| type | integration_secrets_credential_handling |
| template_version | 1.0.0 |
| output_path | 10_app/integrations/IXS-04_Secrets_Credential_Handling.md |
| compliance_gate_id | TMP-05.PRIMARY.IXS |
| upstream_dependencies | ["IXS-01", "IXS-02", "SIGN-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "IXS-02", "SIGN-02", "ADMIN-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical policy for handling secrets and credentials used by integrations: where
they are stored, how they are accessed, rotation schedules, least-privilege access controls, and
compromise response. This template must be consistent with security and audit policies and
must not expose secret material.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- IXS-02 Integration Specs: {{ixs.integration_specs}} | OPTIONAL
- SIGN-02 Signing Keys & Rotation Policy: {{sign.keys_policy}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Credential inventory (credential_id list)
- credential_id (stable identifier)
- integration_id binding (must exist)
- credential type (api_key/oauth_client/secret/webhook_secret/cert/UNKNOWN)
- storage location policy (secret manager/ci vault/env/UNKNOWN)
- access control policy (who/what can read)
- rotation policy (schedule + triggers)
- revocation/compromise response steps
- logging/redaction rules (never log secrets)
- environment scoping (dev/stage/prod separation)
- secret distribution method (runtime fetch vs build-time inject)
- audit logging requirements (access/use events)

## Optional Fields

- Key ceremony notes | OPTIONAL
- mTLS/cert chain notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never include secret values in this document.
- Credentials MUST be scoped per environment unless explicitly justified.
- Access MUST follow least privilege and be auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

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

## Cross-References

Upstream: {{xref:IXS-01}}, {{xref:IXS-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-08}}, {{xref:IXS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. List credentials and storage locations; use UNKNOWN for rotation triggers
if not provided; do not invent.
intermediate: Required. Add access policies, env scoping, distribution method, and audit
requirements.
advanced: Required. Add compromise response rigor and rotation procedures aligned to org
security.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, types present, rotation
triggers, detection signals, notification policy, retention policy, key/cert notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If creds[].credential_id is UNKNOWN → block Completeness Gate.
If creds[].storage_location is UNKNOWN → block Completeness Gate.
If global.no_secret_in_repo_rule is UNKNOWN → block Completeness Gate.
If creds[*].revocation_steps is UNKNOWN → block Completeness Gate.

## Completeness Gate

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
