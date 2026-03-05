# MDL-01 — Link Scheme & Domains (app links, universal links)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDL-01                                             |
| Template Type     | Build / Deep Links                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring link scheme & domains (app links, universal links)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Link Scheme & Domains (app links, universal links) Document                         |

## 2. Purpose

Define the canonical deep link schemes and domains for mobile: custom URL scheme(s), iOS
Universal Links domains, Android App Links domains, and allowlist rules. This template must be
consistent with deep link map and secure deep link handling and must not invent
schemes/domains not present in upstream inputs.

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
| Custom schemes list (s... | spec         | Yes             |
| Primary link domains l... | spec         | Yes             |
| iOS universal links en... | spec         | Yes             |
| Android app links enab... | spec         | Yes             |
| Domain allowlist rules... | spec         | Yes             |
| Path allowlist rules (... | spec         | Yes             |
| Environment difference... | spec         | Yes             |
| Fallback behavior when... | spec         | Yes             |

## 5. Optional Fields

Subdomain policy | OPTIONAL
Link shortener policy | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Domains/schemes MUST be allowlisted and match CSec-05.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Custom Schemes
schemes:
{{schemes[0]}}
{{schemes[1]}} | OPTIONAL
2. Domains
domains:
{{domains[0]}}
{{domains[1]}} | OPTIONAL
allowlist_rule: {{domains.allowlist_rule}} (exact/wildcard/UNKNOWN)
subdomain_policy: {{domains.subdomain_policy}} | OPTIONAL
3. Universal/App Links
ios_universal_links_enabled: {{links.ios_enabled}}
android_app_links_enabled: {{links.android_enabled}}
path_allowlist: {{links.path_allowlist}} | OPTIONAL
4. Environment Differences
dev_domains: {{env.dev_domains}} | OPTIONAL
stage_domains: {{env.stage_domains}} | OPTIONAL
prod_domains: {{env.prod_domains}} | OPTIONAL
scheme_by_env: {{env.scheme_by_env}} | OPTIONAL
5. Fallback When Not Installed
web_fallback_enabled: {{fallback.web_enabled}}
fallback_url_policy: {{fallback.url_policy}} | OPTIONAL
6. References
Deep link map: {{xref:ROUTE-03}} | OPTIONAL
Secure deep link handling: {{xref:CSec-05}} | OPTIONAL
Unknown route handling: {{xref:ROUTE-06}} | OPTIONAL
Cross-References
Upstream: {{xref:ROUTE-03}} | OPTIONAL, {{xref:CSec-05}} | OPTIONAL,
{{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MDL-02}}, {{xref:MDL-03}} | OPTIONAL
Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.

intermediate: Required. Define schemes/domains and whether universal/app links enabled.
advanced: Required. Add env differences, subdomain/link shortener policies.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, secondary schemes/domains, allowlist
rule, subdomain policy, path allowlist, env mappings, fallback url policy, shortener policy,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If schemes list is UNKNOWN → block Completeness Gate.
If domains list is UNKNOWN → block Completeness Gate.
If fallback.web_enabled is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MDL
Pass conditions:
required_fields_present == true
schemes_and_domains_defined == true
platform_link_enablement_defined == true
fallback_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MDL-02

MDL-02 — Routing Rules (link → screen/action mapping)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Domains/schemes MUST be allowlisted and match CSec-05.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Custom Schemes`
2. `## schemes:`
3. `## Domains`
4. `## domains:`
5. `## Universal/App Links`
6. `## Environment Differences`
7. `## Fallback When Not Installed`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:ROUTE-03}} | OPTIONAL, {{xref:CSec-05}} | OPTIONAL,**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MDL-02}}, {{xref:MDL-03}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
