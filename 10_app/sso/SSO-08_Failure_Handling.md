# SSO-08 — Failure Handling (lockouts, partial provision, retries)

## Header Block

| Field | Value |
|---|---|
| template_id | SSO-08 |
| title | Failure Handling (lockouts, partial provision, retries) |
| type | sso_failure_handling |
| template_version | 1.0.0 |
| output_path | 10_app/sso/SSO-08_Failure_Handling.md |
| compliance_gate_id | TMP-05.PRIMARY.SSO |
| upstream_dependencies | ["SSO-02", "SSO-03", "SSO-05", "CER-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "SSO-01", "SSO-02", "SSO-03", "SSO-05", "CER-02", "CER-04", "ADMIN-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical failure handling for SSO and provisioning: login failures, token/assertion
validation failures, account linking/provisioning errors, lockouts, retries, and safe user/operator
remediation. This template must be consistent with retry/session-expiry patterns and must not
introduce unsafe fallbacks.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}}
- SSO-03 Claim Mapping: {{sso.claim_mapping}} | OPTIONAL
- SSO-05 SCIM Provisioning: {{sso.scim}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- CER-04 Session Expiry Handling: {{cer.session_expiry}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Failure taxonomy (authn/authz/claims/provisioning/network)
- User-facing handling rules (what user sees)
- Operator-facing handling rules (what support/admin does)
- Retry rules (when retry allowed vs forbidden)
- Lockout rules (thresholds, cool-down)
- Partial provisioning handling (rollback vs quarantine)
- Account linking conflicts handling
- Session loop prevention rules
- Telemetry requirements (failure rates, lockouts)
- Audit logging requirements (security events)

## Optional Fields

- Provider-specific error mapping | OPTIONAL
- Self-serve recovery flow (contact IT) | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never “fail open” (no granting access on uncertain identity).
- Lockouts must not be bypassable via retries.
- Partial provisioning must not result in elevated access.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Failure Taxonomy
classes:
authn_failed: {{fail.classes.authn_failed}}
assertion_invalid: {{fail.classes.assertion_invalid}}
claims_missing: {{fail.classes.claims_missing}}
provisioning_failed: {{fail.classes.provisioning_failed}}
account_link_conflict: {{fail.classes.account_link_conflict}}
network_timeout: {{fail.classes.network_timeout}} | OPTIONAL
2. User Handling
user_error_ux_rule: {{user.ux_rule}}
when_to_prompt_retry: {{user.prompt_retry_rule}} | OPTIONAL
contact_support_rule: {{user.contact_support_rule}} | OPTIONAL
3. Operator Handling
operator_actions: {{ops.actions}}
runbook_location: {{ops.runbook_location}} | OPTIONAL
4. Retry Rules
retry_allowed_classes: {{retry.allowed_classes}}
max_attempts: {{retry.max_attempts}} | OPTIONAL
backoff_policy: {{retry.backoff_policy}} | OPTIONAL
5. Lockout Rules
lockout_supported: {{lockout.supported}}
threshold: {{lockout.threshold}}
cooldown_minutes: {{lockout.cooldown_minutes}} | OPTIONAL
reset_policy: {{lockout.reset_policy}} | OPTIONAL
6. Partial Provisioning
policy: {{prov.partial_policy}} (rollback/quarantine/UNKNOWN)
quarantine_behavior: {{prov.quarantine_behavior}} | OPTIONAL
rollback_steps: {{prov.rollback_steps}} | OPTIONAL

7. Account Linking Conflicts
conflict_behavior: {{link.conflict_behavior}}
manual_resolution_allowed: {{link.manual_resolution_allowed}} | OPTIONAL
8. Session Loop Prevention
max_login_attempts_per_window: {{loops.max_login_attempts}}
cooldown_ms: {{loops.cooldown_ms}} | OPTIONAL
9. Telemetry
login_failure_metric: {{telemetry.login_failure_metric}}
lockout_metric: {{telemetry.lockout_metric}} | OPTIONAL
provisioning_failure_metric: {{telemetry.provisioning_failure_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
10.Audit Logging
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
retention_policy: {{audit.retention_policy}} | OPTIONAL
11.References
Flow spec: {{xref:SSO-02}}
Claim mapping: {{xref:SSO-03}} | OPTIONAL
SCIM provisioning: {{xref:SSO-05}} | OPTIONAL
Session expiry: {{xref:CER-04}} | OPTIONAL
Security controls: {{xref:SSO-09}} | OPTIONAL
Audit trail: {{xref:ADMIN-03}} | OPTIONAL

## Cross-References

Upstream: {{xref:SSO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SSO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define taxonomy + user UX rule + lockout basics; use UNKNOWN for
provider mappings.
intermediate: Required. Define partial provisioning policy and retry/backoff.
advanced: Required. Add operator runbooks, precise thresholds, and audit/telemetry rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, prompt retry, contact support, runbook
location, retry max/backoff, cooldown/reset, quarantine/rollback, manual resolution, telemetry
fields, audit fields/retention, provider mapping, self-serve recovery, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If user.ux_rule is UNKNOWN → block Completeness Gate.
If lockout.supported is UNKNOWN → block Completeness Gate.
If lockout.threshold is UNKNOWN → block Completeness Gate (when lockout.supported ==
true).

If telemetry.login_failure_metric is UNKNOWN → block Completeness Gate.
If audit.required is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.SSO
Pass conditions:
required_fields_present == true
failure_taxonomy_defined == true
lockout_policy_defined == true
partial_provisioning_policy_defined == true
telemetry_defined == true
audit_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
