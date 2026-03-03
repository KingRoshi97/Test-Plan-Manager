# CER-04 — Session Expiry Handling (re-auth, state preservation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-04                                           |
| Template Type     | Build / Error Handling                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring session expiry handling ( |
| Filled By         | Internal Agent                                   |
| Consumes          | API-04, CSec-01, FE-07, ROUTE-04                 |
| Produces          | Filled Session Expiry Handling (re-auth, state pr|

## 2. Purpose

Define the canonical client behavior when sessions expire or authentication becomes invalid: how 401s are handled, when to prompt re-auth, how to preserve/restore navigation state, and how to avoid loops. This template must be consistent with AuthZ/token storage policies and route guards and must not invent auth flows not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- CSec-01 Token Storage Policy: {{csec.token_policy}} | OPTIONAL
- FE-07 Error UX: {{fe.error_ux}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Session invalidation trig | spec         | No              |
| Detection rules (how clie | spec         | No              |
| Re-auth prompt UX (modal/ | spec         | No              |
| Return-to behavior (resto | spec         | No              |
| State preservation rules  | spec         | No              |
| Refresh token policy (if  | spec         | No              |
| Loop prevention rules (av | spec         | No              |
| Logout fallback rule (whe | spec         | No              |
| Telemetry requirements (s | spec         | No              |
| Security constraints (do  | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Multi-device session inva | spec         | Enrichment only, no new truth  |
| Grace period policy       | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Re-auth behavior MUST align with route guards ({{xref:ROUTE-04}}).
- Token handling MUST align with {{xref:CSec-01}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Session Expiry Handling (re-auth, state preservation)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:API-04}} | OPTIONAL, {{xref:CSec-01}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:CER-05}} | OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, detect signals, prompt copy policy,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If detect.rule is UNKNOWN → block Completeness Gate.
- If ux.primary_action is UNKNOWN → block Completeness Gate.
- If return.restore_rule is UNKNOWN → block Completeness Gate.
- If telemetry.session_expiry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CER
- Pass conditions:
- [ ] required_fields_present == true
- [ ] expiry_detection_defined == true
- [ ] re_auth_ux_defined == true
- [ ] return_to_defined == true
- [ ] logout_fallback_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CER-05
