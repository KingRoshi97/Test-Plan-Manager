# MDL-01 — Universal Links / App Links Registry

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDL-01                                           |
| Template Type     | Build / Deep Links                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring universal links / app lin |
| Filled By         | Internal Agent                                   |
| Consumes          | ROUTE-03, CSec-05                                |
| Produces          | Filled Universal Links / App Links Registry      |

## 2. Purpose

Define the canonical deep link schemes and domains for mobile: custom URL scheme(s), iOS Universal Links domains, Android App Links domains, and allowlist rules. This template must be consistent with deep link map and secure deep link handling and must not invent schemes/domains not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-03 Deep Link Map: {{route.deep_link_map}} | OPTIONAL
- ROUTE-06 Unknown/Invalid Handling: {{route.unknown_handling}} | OPTIONAL
- CSec-05 Secure Deep Link Handling: {{csec.deep_link_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Custom schemes list (sche | spec         | No              |
| Primary link domains list | spec         | No              |
| iOS universal links enabl | spec         | No              |
| Android app links enabled | spec         | No              |
| Domain allowlist rules (e | spec         | No              |
| Path allowlist rules (if  | spec         | No              |
| Environment differences ( | spec         | No              |
| Fallback behavior when no | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Subdomain policy          | spec         | Enrichment only, no new truth  |
| Link shortener policy     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Domains/schemes MUST be allowlisted and match CSec-05.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Universal Links / App Links Registry`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:ROUTE-03}} | OPTIONAL, {{xref:CSec-05}} | OPTIONAL,
- {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:MDL-02}}, {{xref:MDL-03}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, secondary schemes/domains, allowlist
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If schemes list is UNKNOWN → block Completeness Gate.
- If domains list is UNKNOWN → block Completeness Gate.
- If fallback.web_enabled is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MDL
- Pass conditions:
- [ ] required_fields_present == true
- [ ] schemes_and_domains_defined == true
- [ ] platform_link_enablement_defined == true
- [ ] fallback_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] MDL-02
