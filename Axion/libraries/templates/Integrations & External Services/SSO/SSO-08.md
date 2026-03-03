# SSO-08 — Error Handling for SSO (redirect failures, token errors)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-08                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring error handling for sso (r |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-02, SSO-03, SSO-05, CER-02                   |
| Produces          | Filled Error Handling for SSO (redirect failures,|

## 2. Purpose

Define the canonical failure handling for SSO and provisioning: login failures, token/assertion validation failures, account linking/provisioning errors, lockouts, retries, and safe user/operator remediation. This template must be consistent with retry/session-expiry patterns and must not introduce unsafe fallbacks.

## 3. Inputs Required

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

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Failure taxonomy (authn/a | spec         | No              |
| User-facing handling rule | spec         | No              |
| Operator-facing handling  | spec         | No              |
| Retry rules (when retry a | spec         | No              |
| Lockout rules (thresholds | spec         | No              |
| Partial provisioning hand | spec         | No              |
| Account linking conflicts | spec         | No              |
| Session loop prevention r | spec         | No              |
| Telemetry requirements (f | spec         | No              |
| Audit logging requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Provider-specific error m | spec         | Enrichment only, no new truth  |
| Self-serve recovery flow  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never “fail open” (no granting access on uncertain identity).
- Lockouts must not be bypassable via retries.
- Partial provisioning must not result in elevated access.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Error Handling for SSO (redirect failures, token errors)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SSO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, prompt retry, contact support, runbook
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If user.ux_rule is UNKNOWN → block Completeness Gate.
- If lockout.supported is UNKNOWN → block Completeness Gate.
- If lockout.threshold is UNKNOWN → block Completeness Gate (when lockout.supported ==
- If telemetry.login_failure_metric is UNKNOWN → block Completeness Gate.
- If audit.required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SSO
- Pass conditions:
- [ ] required_fields_present == true
- [ ] failure_taxonomy_defined == true
- [ ] lockout_policy_defined == true
- [ ] partial_provisioning_policy_defined == true
- [ ] telemetry_defined == true
- [ ] audit_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SSO-09
