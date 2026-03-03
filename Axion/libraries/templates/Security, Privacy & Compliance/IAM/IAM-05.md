# IAM-05 — Session Management Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-05                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring session management spec   |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Session Management Spec                   |

## 2. Purpose

Define the canonical service-to-service authentication model: how internal services identify each other, what credentials are used (mTLS/JWT), how identities are issued/rotated, and how requests are authorized between services. This template must be consistent with trust boundaries and key/cert management rules.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Security architecture (trust boundaries): `{{xref:SEC-02}}` | OPTIONAL
- Key types/usage: `{{xref:SKM-04}}` | OPTIONAL
- Certificate management: `{{xref:SKM-06}}` | OPTIONAL
- Network policy (allowlists): `{{xref:IXS-03}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Service identity model (service_id naming) | spec | No |
| Auth mechanism (mTLS/JWT/UNKNOWN) | spec | No |
| Where verification happens (gateway/service) | spec | No |
| Credential issuance model (CA/JWT issuer) | spec | No |
| Rotation/renewal rules (SKM refs) | spec | Yes |
| Audience/scope rules for JWT (if used) | spec | Yes |
| Network allowlist policy (which services can call which) | spec | No |
| Authorization model for internal calls (least privilege) | spec | No |
| Telemetry requirements (auth failures, cert expiry) | spec | No |
| Logging/redaction rules (no secrets) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| SPIFFE/SPIRE usage notes | spec | OPTIONAL |
| Break-glass for internal auth | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Internal auth must be verifiable and rotated; no long-lived static secrets.
- Fail closed on identity verification errors.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SKM-03}}`, `{{xref:SEC-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define mechanism, verification point, and allowlist rule. |
| intermediate | Required. Define issuance + rotation and telemetry. |
| advanced | Required. Add JWT audience/scope rigor, SPIFFE notes, and internal permission mapping. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, naming convention, refs, renewal rule, jwt rules, policy ref, permissions, cert expiry metric, spiffe/break-glass, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `auth.mechanism` is UNKNOWN → block Completeness Gate.
- If `auth.verification_point` is UNKNOWN → block Completeness Gate.
- If `net.allowlist_rule` is UNKNOWN → block Completeness Gate.
- If `telemetry.auth_failure_metric` is UNKNOWN → block Completeness Gate.
- If `logs.no_secret_logging_rule` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IAM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] mechanism_and_verification_defined == true
  - [ ] issuance_and_rotation_defined == true
  - [ ] network_policy_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

