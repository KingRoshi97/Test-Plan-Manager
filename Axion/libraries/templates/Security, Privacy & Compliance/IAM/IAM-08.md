# IAM-08 — API Key Policy (creation, scoping, rotation, revocation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-08                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring api key policy (creation, scoping, rotation, revocation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled API Key Policy (creation, scoping, rotation, revocation) Document                         |

## 2. Purpose

Define the canonical policy for API keys: how keys are created, scoped, stored, rotated,
revoked, and audited. This template must be consistent with AuthZ rules and secrets storage
policies and must not invent key capabilities beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API surface: {{xref:API-01}} | OPTIONAL
- AuthZ rules: {{xref:API-04}} | OPTIONAL
- Secrets storage policy: {{xref:SKM-02}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Privileged API catalog: {{xref:ADMIN-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

API key types supported (user key/service key/UNKNOWN)
Key format rule (prefix, length, hashing)
Creation rules (who can create)
Scope model (perm scopes, endpoint scopes)
Default scope rule (least privilege)
Storage rule (hashed at rest)
Rotation policy (intervals, triggers)
Revocation policy (immediate, propagate)
Usage logging rules (what is logged)
Rate limits for key usage (RLIM refs)
Telemetry requirements (key auth success/fail, revoked usage)

Optional Fields
Key expiration support | OPTIONAL
Key allowlist/denylist policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Keys must never be stored in plaintext; store hashes only.
Scopes must be least-privilege and enforceable at authorization points.
Key creation/rotation/revocation must be auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Key Types
types: {{keys.types}}
2. Format
format_rule: {{keys.format_rule}}
hashing_rule: {{keys.hashing_rule}}
3. Creation
who_can_create: {{create.who_can_create}}
creation_surface: {{create.surface}} | OPTIONAL
4. Scoping
scope_model: {{scope.model}}
default_scope_rule: {{scope.default_rule}}
scope_examples: {{scope.examples}} | OPTIONAL
5. Storage
hashed_at_rest: {{store.hashed_at_rest}}
storage_ref: {{store.storage_ref}} (expected: {{xref:SKM-02}}) | OPTIONAL
6. Rotation
rotation_required: {{rotate.required}}
interval_days: {{rotate.interval_days}} | OPTIONAL
rotation_triggers: {{rotate.triggers}} | OPTIONAL
7. Revocation
revoke_supported: {{revoke.supported}}
revoke_rule: {{revoke.rule}}
propagation_rule: {{revoke.propagation_rule}} | OPTIONAL
8. Logging / Rate Limits
usage_log_fields: {{logs.usage_log_fields}}
rate_limit_ref: {{logs.rate_limit_ref}} (expected: {{xref:RLIM-01}}/{{xref:RLIM-02}}) |
OPTIONAL
9. Telemetry
key_auth_success_metric: {{telemetry.auth_success_metric}}
key_auth_failure_metric: {{telemetry.auth_failure_metric}} | OPTIONAL
revoked_key_usage_metric: {{telemetry.revoked_usage_metric}} | OPTIONAL

10.References
AuthZ rules: {{xref:API-04}} | OPTIONAL
Secrets storage: {{xref:SKM-02}} | OPTIONAL
Rate limits: {{xref:RLIM-01}} | OPTIONAL
Audit schema: {{xref:AUDIT-02}} | OPTIONAL
Cross-References
Upstream: {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IAM-10}}, {{xref:AUDIT-01}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define key types, hashing rule, scope model, and revoke rule.
intermediate: Required. Define rotation and logging fields and telemetry.
advanced: Required. Add expiration/allowlist controls and strict propagation/rate-limit linkage.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, creation surface, examples, storage ref,
interval/triggers, propagation, rate limit ref, optional metrics, expiration/allowlist, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If keys.format_rule is UNKNOWN → block Completeness Gate.
If keys.hashing_rule is UNKNOWN → block Completeness Gate.
If scope.model is UNKNOWN → block Completeness Gate.
If revoke.rule is UNKNOWN → block Completeness Gate.
If telemetry.auth_success_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.IAM
Pass conditions:
required_fields_present == true
format_and_hashing_defined == true
scoping_defined == true
rotation_and_revocation_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

IAM-09

IAM-09 — Access Reviews (periodic review, attestations)
Header Block

## 5. Optional Fields

Key expiration support | OPTIONAL
Key allowlist/denylist policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Keys must never be stored in plaintext; store hashes only.**
- **Scopes must be least-privilege and enforceable at authorization points.**
- **Key creation/rotation/revocation must be auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Key Types`
2. `## Format`
3. `## Creation`
4. `## Scoping`
5. `## Storage`
6. `## Rotation`
7. `## Revocation`
8. `## Logging / Rate Limits`
9. `## OPTIONAL`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IAM-10}}, {{xref:AUDIT-01}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
