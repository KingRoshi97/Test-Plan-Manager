# SSO-03 — Token Lifecycle (issuance, refresh, revocation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-03                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring token lifecycle (issuance |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-01, API-04, ROUTE-04                         |
| Produces          | Filled Token Lifecycle (issuance, refresh, revoca|

## 2. Purpose

Define the canonical mapping from identity provider claims/attributes to internal roles/permissions, including provisioning rules, default roles, group mappings, and handling of missing/invalid claims. This template must be consistent with AuthZ rules and must not invent roles/permissions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL
- API-04 AuthZ Rules (roles/claims): {{api.authz_rules}}
- ROUTE-04 Guard Rules (client gating): {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| provider_id binding       | spec         | No              |
| claim sources (id_token / | spec         | No              |
| required claim list (must | spec         | No              |
| claim normalization rules | spec         | No              |
| role mapping rules (claim | spec         | No              |
| permission mapping rules  | spec         | No              |
| default role rule (if map | spec         | No              |
| group mapping rules (IdP  | spec         | No              |
| provisioning behavior (cr | spec         | No              |
| deprovisioning behavior ( | spec         | No              |
| error handling (missing/i | spec         | No              |
| audit/telemetry requireme | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Multi-tenant org mapping  | spec         | Enrichment only, no new truth  |
| Just-in-time provisioning | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not invent role_ids/permissions; bind only to {{xref:API-04}}.
- Never grant elevated roles by default unless explicitly required.
- Missing required claims MUST cause a safe failure or safe default (least privilege).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Token Lifecycle (issuance, refresh, revocation)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SSO-01}}, {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SSO-04}}, {{xref:SSO-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, optional claims, parse rules, mapping
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If claims.required is UNKNOWN → block Completeness Gate.
- If defaults.default_role_id is UNKNOWN → block Completeness Gate.
- If defaults.deny_on_missing_required_claims is UNKNOWN → block Completeness Gate.
- If telemetry.role_assignment_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SSO
- Pass conditions:
- [ ] required_fields_present == true
- [ ] provider_id_exists_in_SSO_01 == true
- [ ] all role_ids/permissions exist in API-04
- [ ] least_privilege_defaults_defined == true
- [ ] audit_and_telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SSO-04
