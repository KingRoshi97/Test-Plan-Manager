# SSO-04 — Session Management (timeout, concurrent, device binding)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-04                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring session management (timeo |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-02, CSec-01, CER-04                          |
| Produces          | Filled Session Management (timeout, concurrent, d|

## 2. Purpose

Define the canonical rules for exchanging SSO assertions/tokens into application sessions, including session duration, refresh behavior, token storage/rotation, revocation handling, and logout semantics. This template must be consistent with client token storage and session expiry handling and must not invent auth mechanisms not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}}
- CSec-01 Token Storage Policy: {{csec.token_storage}} | OPTIONAL
- CER-04 Session Expiry Handling: {{cer.session_expiry}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| provider_id binding       | spec         | No              |
| session model (cookie/ses | spec         | No              |
| session creation rule (wh | spec         | No              |
| session duration policy ( | spec         | No              |
| refresh supported (yes/no | spec         | No              |
| refresh trigger rules (wh | spec         | No              |
| refresh failure behavior  | spec         | No              |
| token rotation rules (if  | spec         | No              |
| revocation handling (IdP  | spec         | No              |
| logout behavior (local +  | spec         | No              |
| secure storage binding (C | spec         | No              |
| telemetry requirements (r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Backchannel logout (OIDC) | spec         | Enrichment only, no new truth  |
| Session binding to device | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Tokens MUST be stored/handled per {{xref:CSec-01}}.
- Session expiry behavior MUST align to {{xref:CER-04}}.
- Refresh loops must be prevented; failures must degrade safely.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Session Management (timeout, concurrent, device binding)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SSO-01}}, {{xref:SSO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SSO-05}}, {{xref:SSO-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, storage ref, idle ttl/renewal, refresh
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If session.model is UNKNOWN → block Completeness Gate.
- If ttl.absolute_ttl_seconds is UNKNOWN → block Completeness Gate.
- If refresh.on_fail is UNKNOWN → block Completeness Gate (when refresh.supported == true).
- If revoke.on_revoked_behavior is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SSO
- Pass conditions:
- [ ] required_fields_present == true
- [ ] provider_id_exists_in_SSO_01 == true
- [ ] session_model_and_ttl_defined == true
- [ ] refresh_or_no_refresh_defined == true
- [ ] revocation_and_logout_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SSO-05
