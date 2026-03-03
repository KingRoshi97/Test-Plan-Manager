# SSO-07 — Provisioning & Deprovisioning (SCIM, JIT, offboarding)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-07                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring provisioning & deprovisio |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-02, API-04, ADMIN-01                         |
| Produces          | Filled Provisioning & Deprovisioning (SCIM, JIT, |

## 2. Purpose

Define the canonical MFA and step-up authentication rules: what triggers step-up, what assurance levels are required for sensitive actions, how the client/server enforce it, and what the user experience is when step-up is required. This template must be consistent with AuthZ rules and admin capability risk levels and must not invent roles/actions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-01 Admin Capabilities Matrix: {{admin.capabilities}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| MFA supported (yes/no/UNK | spec         | No              |
| Assurance level model (AA | spec         | No              |
| Step-up triggers (actions | spec         | No              |
| Per-action requirement ma | spec         | No              |
| How step-up is enforced ( | spec         | No              |
| How step-up is requested  | spec         | No              |
| Session binding for step- | spec         | No              |
| Failure handling (deny, r | spec         | No              |
| Telemetry requirements (s | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Remembered device policy  | spec         | Enrichment only, no new truth  |
| Risk engine inputs        | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Step-up MUST be enforced server-side for privileged actions.
- Do not rely on client-only checks for MFA/assurance enforcement.
- If MFA is not supported, privileged actions requiring step-up MUST be blocked or redesigned.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Provisioning & Deprovisioning (SCIM, JIT, offboarding)`
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, providers supporting mfa, assurance
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If mfa.supported is UNKNOWN → block Completeness Gate.
- If enforce.server_enforced is UNKNOWN → block Completeness Gate.
- If enforce.deny_rule is UNKNOWN → block Completeness Gate.
- If telemetry.challenge_shown_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SSO
- Pass conditions:
- [ ] required_fields_present == true
- [ ] mfa_support_defined == true
- [ ] per_action_requirements_defined == true
- [ ] server_enforcement_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SSO-08
