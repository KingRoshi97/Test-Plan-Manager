# SSO-09 — Security Controls (PKCE, signature validation, replay defense)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-09                                             |
| Template Type     | Integration / SSO & Identity                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security controls (pkce, signature validation, replay defense)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Controls (PKCE, signature validation, replay defense) Document                         |

## 2. Purpose

Define the canonical security control requirements for SSO: PKCE usage, redirect/callback
hardening, token/assertion signature validation, replay defenses (state/nonce), secure
cookie/session settings, and logging/redaction. This template must be consistent with client
token storage and deep link security and must not invent controls not applicable to the chosen
protocol/provider.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}}
- SSO-04 Session/Token Exchange: {{sso.session_rules}} | OPTIONAL
- CSec-01 Token Storage: {{csec.token_storage}} | OPTIONAL
- CSec-05 Secure Deep Link Handling: {{csec.deep_link_security}} | OPTIONAL
- CER-05 Logging/Redaction: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Redirect URI allowlist... | spec         | Yes             |
| State required rule (C... | spec         | Yes             |
| Nonce required rule (O... | spec         | Yes             |
| PKCE required rule (wh... | spec         | Yes             |
| Signature validation r... | spec         | Yes             |
| Issuer/audience valida... | spec         | Yes             |
| Replay prevention wind... | spec         | Yes             |
| Key rotation/JWKS cach... | spec         | Yes             |
| Logging/redaction rule... | spec         | Yes             |
| Security telemetry req... | spec         | Yes             |

## 5. Optional Fields

mTLS between app and IdP | OPTIONAL
Advanced token binding (DPoP/MTLS OIDC) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **No skipping signature validation.**
- **No dynamic redirects; redirect URIs must be fixed/allowlisted.**
- **Controls must be deterministic and enforceable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Applicability Map`
2. `## Provider Controls`
3. `## (Repeat per provider_id.)`
4. `## Redirect & Callback Hardening`
5. `## State / Nonce / Replay`
6. `## PKCE`
7. `## Signature / Claims Validation`
8. `## Key Rotation / JWKS`
9. `## Session Security`
10. `## Logging / Redaction`

## 8. Cross-References

- **Upstream: {{xref:SSO-01}}, {{xref:SSO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SSO-10}} | OPTIONAL**
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
