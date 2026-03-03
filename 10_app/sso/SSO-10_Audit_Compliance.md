# SSO-10 — Audit & Compliance (login events, admin actions, retention)

## Header Block

| Field | Value |
|---|---|
| template_id | SSO-10 |
| title | Audit & Compliance (login events, admin actions, retention) |
| type | sso_audit_compliance |
| template_version | 1.0.0 |
| output_path | 10_app/sso/SSO-10_Audit_Compliance.md |
| compliance_gate_id | TMP-05.PRIMARY.SSO |
| upstream_dependencies | ["SSO-02", "SSO-03", "ADMIN-03", "CER-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "SSO-01", "SSO-02", "SSO-03", "SSO-05", "ADMIN-03", "CER-05"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical audit and compliance requirements for SSO: what events must be
recorded (logins, failures, lockouts, provisioning, role assignments), required fields, retention,
redaction, and how audit data is accessed for investigations. This template must be consistent
with global audit trail and logging/redaction rules.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL
- SSO-03 Claim/Role Mapping: {{sso.claim_mapping}} | OPTIONAL
- SSO-05 SCIM Provisioning: {{sso.scim}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}}
- CER-05 Logging/Crash Reporting: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Audited event types list (login, failure, lockout, role assigned, provisioned)
- Event schema (required fields)
- Correlation fields (request_id, trace_id)
- Identity fields policy (hashing, redaction)
- Retention policy (days)
- Access policy (who can view)
- Export policy (for compliance)
- Alerting triggers (suspicious patterns)
- Tamper-evidence expectations (append-only)
- Deletion policy for audit logs (if any)

## Optional Fields

- SIEM forwarding rules | OPTIONAL
- Geo/IP capture policy | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Audit logs must be append-only and tamper-evident where possible.
- Do not store raw secrets/tokens; sensitive identifiers should be hashed as required.
- Retention must be explicit and enforced.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Audited Event Types
events: {{audit.events}}
2. Event Schema (Required Fields)
timestamp: {{schema.timestamp}}
event_type: {{schema.event_type}}
provider_id: {{schema.provider_id}} | OPTIONAL
user_id_hash: {{schema.user_id_hash}} | OPTIONAL
subject_identifier_hash: {{schema.subject_id_hash}} | OPTIONAL
result: {{schema.result}}
reason_code: {{schema.reason_code}} | OPTIONAL
request_id: {{schema.request_id}} | OPTIONAL
trace_id: {{schema.trace_id}} | OPTIONAL
ip_hash_or_policy: {{schema.ip_policy}} | OPTIONAL
3. Correlation Rules
correlate_with_server_logs: {{corr.with_server}}
correlation_id_sources: {{corr.id_sources}} | OPTIONAL
4. Identity Fields Policy
hashing_rule: {{identity.hashing_rule}}
redaction_rule: {{identity.redaction_rule}} | OPTIONAL
5. Retention
retention_days: {{retention.days}}
archive_policy: {{retention.archive_policy}} | OPTIONAL
6. Access Policy
who_can_view: {{access.who_can_view}}
approval_required: {{access.approval_required}} | OPTIONAL
7. Export Policy
export_supported: {{export.supported}}
export_format: {{export.format}} | OPTIONAL
export_audit_required: {{export.export_audit_required}} | OPTIONAL

8. Alerting
suspicious_login_alert: {{alerts.suspicious_login_alert}}
lockout_spike_alert: {{alerts.lockout_spike_alert}} | OPTIONAL
9. Tamper Evidence
append_only_rule: {{tamper.append_only_rule}}
integrity_checks: {{tamper.integrity_checks}} | OPTIONAL
10.Deletion Policy
delete_audit_logs: {{delete.delete_audit_logs}}
delete_exceptions: {{delete.exceptions}} | OPTIONAL
11.References
Global audit trail: {{xref:ADMIN-03}}
Logging/redaction: {{xref:CER-05}} | OPTIONAL
Failure handling: {{xref:SSO-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:ADMIN-03}}, {{xref:SSO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-02}} | OPTIONAL
Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define event types + retention + append-only rule; use UNKNOWN for
SIEM forwarding.
intermediate: Required. Define schema fields, access policy, and alert triggers.
advanced: Required. Add export policy, integrity checks, and correlation rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, provider/user hashes, reason code, ids,
ip policy, id sources, redaction rule, archive policy, approval required, export fields, optional
alerts, integrity checks, delete exceptions, siem/geo policy, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If audit.events is UNKNOWN → block Completeness Gate.
If retention.days is UNKNOWN → block Completeness Gate.
If access.who_can_view is UNKNOWN → block Completeness Gate.
If tamper.append_only_rule is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.SSO
Pass conditions:
required_fields_present == true
audit_events_defined == true
schema_defined == true
retention_defined == true
access_policy_defined == true

tamper_evidence_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
