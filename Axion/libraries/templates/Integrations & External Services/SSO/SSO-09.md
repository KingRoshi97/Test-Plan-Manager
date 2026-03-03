# SSO-09 — SSO Observability (login metrics, failure dashboards)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-09                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring sso observability (login  |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-02, CSec-01, CSec-05                         |
| Produces          | Filled SSO Observability (login metrics, failure |

## 2. Purpose

Define the canonical security control requirements for SSO: PKCE usage, redirect/callback hardening, token/assertion signature validation, replay defenses (state/nonce), secure cookie/session settings, and logging/redaction. This template must be consistent with client token storage and deep link security and must not invent controls not applicable to the chosen protocol/provider.

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
| Provider/protocol applica | spec         | No              |
| Redirect URI allowlist ru | spec         | No              |
| State required rule (CSRF | spec         | No              |
| Nonce required rule (OIDC | spec         | No              |
| PKCE required rule (where | spec         | No              |
| Signature validation rule | spec         | No              |
| Issuer/audience validatio | spec         | No              |
| Replay prevention window  | spec         | No              |
| Secure session settings ( | spec         | No              |
| Key rotation/JWKS caching | spec         | No              |
| Logging/redaction rules ( | spec         | No              |
| Security telemetry requir | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| mTLS between app and IdP  | spec         | Enrichment only, no new truth  |
| Advanced token binding (D | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- No skipping signature validation.
- No dynamic redirects; redirect URIs must be fixed/allowlisted.
- Controls must be deterministic and enforceable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## SSO Observability (login metrics, failure dashboards)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SSO-01}}, {{xref:SSO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SSO-10}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, pkce required, nonce required, jwks
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If redirect.allowlist_rule is UNKNOWN → block Completeness Gate.
- If validate.signature_rule is UNKNOWN → block Completeness Gate.
- If validate.issuer_rule is UNKNOWN → block Completeness Gate.
- If session.token_redaction_rule is UNKNOWN → block Completeness Gate.
- If telemetry.signature_fail_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SSO
- Pass conditions:
- [ ] required_fields_present == true
- [ ] redirect_and_replay_controls_defined == true
- [ ] signature_and_claims_validation_defined == true
- [ ] session_security_defined == true
- [ ] security_telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SSO-10
