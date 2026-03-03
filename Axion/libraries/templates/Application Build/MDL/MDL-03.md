# MDL-03 — Deferred Deep Link Handling (install → link resume)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDL-03                                           |
| Template Type     | Build / Deep Links                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring deferred deep link handli |
| Filled By         | Internal Agent                                   |
| Consumes          | CSec-05, ROUTE-04, MDL-02                        |
| Produces          | Filled Deferred Deep Link Handling (install → lin|

## 2. Purpose

Define the canonical auth gating and safety rules for mobile deep links, including how signed links are validated (if supported), how auth-required targets behave when logged out, and how to prevent unsafe actions via links. This template must be consistent with secure deep link handling and route guard rules and must not invent security mechanics not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CSec-05 Secure Deep Link Handling: {{csec.deep_link_security}}
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- MDL-02 Routing Rules: {{mobile.routing_rules}} | OPTIONAL
- CER-04 Session Expiry Handling: {{cer.session_expiry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Auth-required target rule | spec         | No              |
| Logged-out behavior (logi | spec         | No              |
| Signed link support (true | spec         | No              |
| Signature validation rule | spec         | No              |
| Expiry rules (if signed/l | spec         | No              |
| Sensitive action protecti | spec         | No              |
| Replay protection rules ( | spec         | No              |
| Telemetry requirements (i | spec         | No              |
| Error UX rules (safe mess | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Device binding rules      | spec         | Enrichment only, no new truth  |
| Multi-tenant context rule | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Signed link failures MUST not leak verification details.
- Auth gating MUST align with {{xref:ROUTE-04}} and session rules with {{xref:CER-04}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Deferred Deep Link Handling (install → link resume)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CSec-05}}, {{xref:MDL-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:MDL-04}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, identify rule, fallback route, signature
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If logged_out.return_to_rule is UNKNOWN → block Completeness Gate.
- If signed.supported is UNKNOWN → block Completeness Gate (for apps using signed links).
- If telemetry.auth_denied_metric is UNKNOWN → block Completeness Gate.
- If ux.safe_copy_rules is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MDL
- Pass conditions:
- [ ] required_fields_present == true
- [ ] auth_gating_defined == true
- [ ] safety_rules_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] MDL-04
