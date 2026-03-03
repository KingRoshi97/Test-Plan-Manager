# WHCP-05 — Security Rules (signatures, secrets rotation, allowlists)

## Header Block

| Field | Value |
|---|---|
| template_id | WHCP-05 |
| title | Security Rules (signatures, secrets rotation, allowlists) |
| type | webhook_security_rules |
| template_version | 1.0.0 |
| output_path | 10_app/webhooks/WHCP-05_Security_Rules.md |
| compliance_gate_id | TMP-05.PRIMARY.WHCP |
| upstream_dependencies | ["WHCP-02", "WHCP-03", "IXS-04", "IXS-03"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "WHCP-01", "WHCP-02", "WHCP-03", "IXS-04", "IXS-03", "CSec-05", "CER-05"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical security controls for webhooks: signature verification/signing, secret
storage/rotation, endpoint allowlists, replay defense, request validation, and safe logging. This
template must be consistent with integration secrets/network policies and must not introduce
security gaps between inbound and outbound flows.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-02 Outbound Producer Spec: {{whcp.outbound}} | OPTIONAL
- WHCP-03 Inbound Consumer Spec: {{whcp.inbound}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}}
- IXS-03 Connectivity/Allowlists: {{ixs.network_policy}} | OPTIONAL
- CSec-05 Secure Link Handling (patterns): {{csec.deep_link_security}} | OPTIONAL
- CER-05 Logging/Redaction: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Security baseline statement
- Signature required rule (inbound/outbound)
- Signature scheme(s) supported (HMAC/JWS/mTLS/UNKNOWN)
- Canonical string/signature construction rule
- Timestamp/replay protection rule (if used)
- Secret storage/rotation binding (IXS-04)
- IP allowlist policy (if supported)
- Request size limits and content-type policy
- Schema validation rule (payload)
- Failure response policy (what status codes)
- Logging/redaction rules (never log secrets/payload PII)
- Telemetry requirements (invalid signature, blocked IP)

## Optional Fields

- Key rotation overlap window | OPTIONAL
- mTLS config notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Inbound verification MUST happen before processing.
- Secrets must never be exposed in logs or responses.
- Reject requests that fail signature/allowlist/validation with safe responses.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Baseline
baseline_statement: {{baseline.statement}}
2. Signature Requirements
inbound_requires_signature: {{sig.inbound_required}}
outbound_signs_payloads: {{sig.outbound_signs}}
schemes_supported: {{sig.schemes_supported}}
3. Canonical String / Construction
canonical_string_rule: {{sig.canonical_string_rule}}
signature_header_rule: {{sig.signature_header_rule}} | OPTIONAL
timestamp_header_rule: {{sig.timestamp_header_rule}} | OPTIONAL
4. Replay Protection
replay_protection_supported: {{replay.supported}}
max_skew_seconds: {{replay.max_skew_seconds}} | OPTIONAL
nonce_rule: {{replay.nonce_rule}} | OPTIONAL
5. Secrets & Rotation
secret_policy_ref: {{secrets.ref}} (expected: {{xref:IXS-04}})
rotation_required: {{secrets.rotation_required}}
overlap_window_seconds: {{secrets.overlap_window_seconds}} | OPTIONAL
6. Allowlists
ip_allowlist_supported: {{allow.ip_allowlist_supported}}
ip_allowlist_rule: {{allow.ip_allowlist_rule}} | OPTIONAL
egress_allowlist_ref: {{allow.egress_allowlist_ref}} (expected: {{xref:IXS-03}}) |
OPTIONAL
7. Request Constraints
max_body_bytes: {{req.max_body_bytes}}
allowed_content_types: {{req.allowed_content_types}}
reject_unknown_content_type: {{req.reject_unknown_content_type}} | OPTIONAL

8. Schema Validation
schema_validation_required: {{schema.required}}
schema_ref_rule: {{schema.ref_rule}} | OPTIONAL
9. Failure Responses
on_invalid_signature: {{fail.on_invalid_signature}}
on_blocked_ip: {{fail.on_blocked_ip}} | OPTIONAL
on_invalid_schema: {{fail.on_invalid_schema}} | OPTIONAL
10.Logging / Redaction
no_secrets_in_logs: {{logs.no_secrets_in_logs}}
pii_redaction_rule: {{logs.pii_redaction_rule}} | OPTIONAL
log_field_allowlist: {{logs.field_allowlist}} | OPTIONAL
11.Telemetry
invalid_signature_metric: {{telemetry.invalid_signature_metric}}
blocked_ip_metric: {{telemetry.blocked_ip_metric}} | OPTIONAL
schema_fail_metric: {{telemetry.schema_fail_metric}} | OPTIONAL
12.References
Webhook catalog: {{xref:WHCP-01}}
Outbound spec: {{xref:WHCP-02}} | OPTIONAL
Inbound spec: {{xref:WHCP-03}} | OPTIONAL
Secrets policy: {{xref:IXS-04}}
Connectivity allowlists: {{xref:IXS-03}} | OPTIONAL
Observability: {{xref:WHCP-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:WHCP-06}}, {{xref:WHCP-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define baseline + signature required + secret policy ref + max body size.
intermediate: Required. Define canonical string rules, replay/allowlist policies, and failure
responses.
advanced: Required. Add rotation overlap window, mTLS notes, and telemetry rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, header rules, max skew/nonce, overlap
window, ip allowlist rule, egress allowlist ref, reject unknown content type, schema ref rule,
optional fail policies, pii redaction/log allowlist, optional telemetry, mtls notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If baseline.statement is UNKNOWN → block Completeness Gate.
If sig.inbound_required is UNKNOWN → block Completeness Gate.
If secrets.ref is UNKNOWN → block Completeness Gate.

If req.max_body_bytes is UNKNOWN → block Completeness Gate.
If telemetry.invalid_signature_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
signature_and_secret_policies_defined == true
request_constraints_defined == true
failure_responses_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
