# CSec-05 — Client Audit & Telemetry (events, consent, retention)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CSec-05                                          |
| Template Type     | Build / Client Security                          |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring client audit & telemetry  |
| Filled By         | Internal Agent                                   |
| Consumes          | ROUTE-03, ROUTE-06, CSec-01                      |
| Produces          | Filled Client Audit & Telemetry (events, consent,|

## 2. Purpose

Define the canonical security rules for deep link handling: allowlists, strict param parsing, signature verification if used, safe redirect prevention, auth gating, and telemetry for abuse detection. This template must be consistent with route validation policies and must not invent security mechanics not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-03 Deep Link Map: {{route.deep_link_map}} | OPTIONAL
- ROUTE-06 Link Validation & Unknown Handling: {{route.unknown_handling}} | OPTIONAL
- CSec-01 Token Storage Policy: {{csec.token_storage}} | OPTIONAL
- MDL-01 Link Scheme & Domains: {{mobile.links}} | OPTIONAL
- MDL-03 Auth Gating & Safety: {{mobile.link_safety}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Allowed schemes/domains a | spec         | No              |
| Strict parsing rules (rej | spec         | No              |
| Signature validation (if  | spec         | No              |
| Auth gating rules for dee | spec         | No              |
| Sensitive action protecti | spec         | No              |
| Open redirect prevention  | spec         | No              |
| Telemetry requirements (l | spec         | No              |
| Error handling (invalid l | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Link expiry rules         | spec         | Enrichment only, no new truth  |
| One-time links policy     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Deep links MUST be allowlisted and validated before navigation.
- No open redirects.
- If signature validation is used, failures MUST not leak details.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Client Audit & Telemetry (events, consent, retention)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:ROUTE-03}} | OPTIONAL, {{xref:ROUTE-06}} | OPTIONAL,
- {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CER-04}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, domains allowlist, decode rules,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If allowlist.schemes is UNKNOWN → block Completeness Gate.
- If parse.reject_unknown_keys is UNKNOWN → block Completeness Gate.
- If security.no_open_redirects_rule is UNKNOWN → block Completeness Gate.
- If ux.invalid_link_ux is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CSec
- Pass conditions:
- [ ] required_fields_present == true
- [ ] allowlist_defined == true
- [ ] parsing_and_redirect_rules_defined == true
- [ ] telemetry_defined == true
- [ ] invalid_link_ux_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Mobile Implementation (MOB)
- [ ] Mobile Implementation (MOB)
- [ ] MOB-01 Navigation Map (stacks/tabs/modals)
- [ ] MOB-02 Screen Implementation Spec (per screen binding)
- [ ] MOB-03 Native Integration Map (bridges, permissions)
- [ ] MOB-04 App Lifecycle + State (foreground/background)
- [ ] MOB-05 Release & Signing (stores, builds)
- [ ] MOB-01
