# SSO-06 — Account Linking Rules (existing user merge policy)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-06                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring account linking rules (ex |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-02, SSO-03, API-04, DATA-06                  |
| Produces          | Filled Account Linking Rules (existing user merge|

## 2. Purpose

Define the canonical rules for linking external identities (SSO providers) to internal user accounts, including when accounts auto-link, when user confirmation is required, how identity merges are performed, and how to prevent account takeover. This template must be consistent with AuthZ and data schema rules and must not invent identity fields beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL
- SSO-03 Claim Mapping: {{sso.claim_mapping}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- DATA-06 Data Schemas (identity/user): {{data.schemas}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Identity keys used for li | spec         | No              |
| Auto-link policy (allowed | spec         | No              |
| User confirmation rules ( | spec         | No              |
| Linking constraints (one- | spec         | No              |
| Merge eligibility rules ( | spec         | No              |
| Merge strategy (fields pr | spec         | No              |
| Audit logging requirement | spec         | No              |
| Security controls (preven | spec         | No              |
| Unlink policy (is unlink  | spec         | No              |
| Telemetry requirements (l | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Cross-tenant linking rule | spec         | Enrichment only, no new truth  |
| Admin-assisted merge rule | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never link accounts based on unverified identifiers.
- Merges MUST be auditable and reversible if possible.
- Linking must not grant elevated roles beyond claim mapping rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Account Linking Rules (existing user merge policy)`
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, auto conditions, ui pattern, duplicate rule,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If link.keys is UNKNOWN → block Completeness Gate.
- If link.verified_identifier_rule is UNKNOWN → block Completeness Gate.
- If telemetry.link_success_metric is UNKNOWN → block Completeness Gate.
- If audit.required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SSO
- Pass conditions:
- [ ] required_fields_present == true
- [ ] linking_keys_and_verification_defined == true
- [ ] auto_link_or_confirmation_defined == true
- [ ] security_controls_defined == true
- [ ] audit_and_telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SSO-07
