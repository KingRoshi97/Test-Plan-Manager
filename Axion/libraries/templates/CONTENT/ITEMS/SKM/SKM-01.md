# SKM-01 — Secrets Inventory (by secret_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-01                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring secrets inventory (by secret_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Secrets Inventory (by secret_id) Document                         |

## 2. Purpose

Create the single, canonical inventory of secrets and keys used by the system, indexed by
secret_id, including what each secret is for, where it is stored, who can access it, rotation
requirements, and which components depend on it. This template must not include secret
values.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets/credentials policy (integration): {{xref:IXS-04}} | OPTIONAL
- Payment providers: {{xref:PAY-01}} | OPTIONAL
- Notification providers: {{xref:NOTIF-02}} | OPTIONAL
- Storage providers: {{xref:FMS-01}} | OPTIONAL
- SSO providers: {{xref:SSO-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Secrets registry (secret_id list)
secret_id (stable identifier)
Secret type (api_key/oauth_client_secret/jwt_signing_key/tls_cert/UNKNOWN)
Purpose/usage
Owning system/component
Storage location class (vault/env/kms/UNKNOWN)
Access policy (who can read)
Rotation required (yes/no/UNKNOWN)
Rotation interval (days) (or NONE/UNKNOWN)
Dependencies (services/providers that use it)
Redaction/logging rule (never log)
Audit requirements (access to secret)

Optional Fields
Environment scoping (dev/stage/prod) | OPTIONAL
Expiry date (for certs) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never include secret values or raw material.
Every secret must have an owner and an access policy.
If a secret is rotation_required, interval must be defined (or approved UNKNOWN with flag).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_secrets: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Secrets (repeat per secret_id)
Secret
secret_id: {{secrets[0].secret_id}}
type: {{secrets[0].type}}
purpose: {{secrets[0].purpose}}
owner_component: {{secrets[0].owner_component}}
storage_class: {{secrets[0].storage_class}}
access_policy: {{secrets[0].access_policy}}
rotation_required: {{secrets[0].rotation_required}}
rotation_interval_days: {{secrets[0].rotation_interval_days}}
dependencies: {{secrets[0].dependencies}}
env_scope: {{secrets[0].env_scope}} | OPTIONAL
expiry_date: {{secrets[0].expiry_date}} | OPTIONAL
logging_rule: {{secrets[0].logging_rule}}
audit_required: {{secrets[0].audit_required}}
open_questions:
{{secrets[0].open_questions[0]}} | OPTIONAL
(Repeat per secret.)
3. References
Storage/access policy: {{xref:SKM-02}} | OPTIONAL
Rotation policy: {{xref:SKM-03}} | OPTIONAL
Compromise response: {{xref:SKM-08}} | OPTIONAL
Cross-References
Upstream: {{xref:IXS-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:SKM-02}}, {{xref:SKM-03}}, {{xref:SKM-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. List secrets and purposes and owners; no values.
intermediate: Required. Add storage class, access policy, rotation rules.
advanced: Required. Add dependencies mapping and audit/expiry rigor and env scoping.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, env scope, expiry date, rotation
interval if flagged, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If secrets[].secret_id is UNKNOWN → block Completeness Gate.
If secrets[].owner_component is UNKNOWN → block Completeness Gate.
If secrets[].access_policy is UNKNOWN → block Completeness Gate.
If secrets[].logging_rule is UNKNOWN → block Completeness Gate.
If secrets[*].rotation_required is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SKM
Pass conditions:
required_fields_present == true
secret_ids_unique == true
owners_and_access_policies_defined == true
rotation_rules_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SKM-02

SKM-02 — Storage & Access Policy (vaults, env scoping, least privilege)
Header Block

## 5. Optional Fields

Environment scoping (dev/stage/prod) | OPTIONAL
Expiry date (for certs) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never include secret values or raw material.**
- **Every secret must have an owner and an access policy.**
- If a secret is rotation_required, interval must be defined (or approved UNKNOWN with flag).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Secrets (repeat per secret_id)`
3. `## Secret`
4. `## open_questions:`
5. `## (Repeat per secret.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:IXS-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SKM-02}}, {{xref:SKM-03}}, {{xref:SKM-09}} | OPTIONAL**
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
