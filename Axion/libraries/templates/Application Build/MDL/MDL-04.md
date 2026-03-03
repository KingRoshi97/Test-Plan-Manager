# MDL-04 — Link Validation & Fallback Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDL-04                                           |
| Template Type     | Build / Deep Links                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring link validation & fallbac |
| Filled By         | Internal Agent                                   |
| Consumes          | MDL-01, ROUTE-06, ROUTE-03                       |
| Produces          | Filled Link Validation & Fallback Rules          |

## 2. Purpose

Define the canonical fallback behaviors for mobile deep links, including what happens when the app is not installed, when a route is unknown/invalid, and when a link cannot be resolved. This template must be consistent with link scheme/domains and unknown route handling and must not invent fallback routes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MDL-01 Scheme & Domains: {{mobile.links}}
- ROUTE-06 Unknown Handling: {{route.unknown_handling}} | OPTIONAL
- ROUTE-03 Deep Link Map: {{route.deep_link_map}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Not-installed behavior (w | spec         | No              |
| Unknown route behavior (n | spec         | No              |
| Invalid param behavior (f | spec         | No              |
| Expired link behavior (if | spec         | No              |
| Store routing rules (iOS/ | spec         | No              |
| Telemetry requirements (f | spec         | No              |
| User copy policy (safe me | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Deferred deep link provid | spec         | Enrichment only, no new truth  |
| Per-env differences       | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Fallbacks MUST not create open redirects or unsafe navigation.
- Unknown routes MUST follow {{xref:ROUTE-06}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Link Validation & Fallback Rules`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:MDL-01}}, {{xref:ROUTE-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:MPUSH-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, web fallback url, store URLs, not_found
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If not_installed.store_redirect_enabled is UNKNOWN → block Completeness Gate.
- If unknown.route_rule is UNKNOWN → block Completeness Gate.
- If telemetry.fallback_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MDL
- Pass conditions:
- [ ] required_fields_present == true
- [ ] not_installed_defined == true
- [ ] unknown_invalid_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Push Notifications (MPUSH)
- [ ] Push Notifications (MPUSH)
- [ ] MPUSH-01 Notification Types Catalog (by notif_id)
- [ ] MPUSH-02 Payload Contract (fields, routing, localization keys)
- [ ] MPUSH-03 Permission & Opt-In Rules (platform specific)
- [ ] MPUSH-04 Delivery/Retry Rules (quiet hours, collapse keys)
- [ ] MPUSH-05 Deep Link Routing (notif tap behavior)
- [ ] MPUSH-06 Abuse/Spam Controls for Notifications
- [ ] MPUSH-01
