# MDL-04 — Fallback Behavior (not installed, unknown routes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDL-04                                             |
| Template Type     | Build / Deep Links                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring fallback behavior (not installed, unknown routes)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Fallback Behavior (not installed, unknown routes) Document                         |

## 2. Purpose

Define the canonical fallback behaviors for mobile deep links, including what happens when the
app is not installed, when a route is unknown/invalid, and when a link cannot be resolved. This
template must be consistent with link scheme/domains and unknown route handling and must
not invent fallback routes not present in upstream inputs.

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
| Not-installed behavior... | spec         | Yes             |
| Unknown route behavior... | spec         | Yes             |
| Invalid param behavior... | spec         | Yes             |
| Expired link behavior ... | spec         | Yes             |
| Store routing rules (i... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| User copy policy (safe... | spec         | Yes             |

## 5. Optional Fields

Deferred deep link provider notes | OPTIONAL
Per-env differences | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Fallbacks MUST not create open redirects or unsafe navigation.
Unknown routes MUST follow {{xref:ROUTE-06}}.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Not Installed
web_fallback_enabled: {{not_installed.web_enabled}}
web_fallback_url: {{not_installed.web_url}} | OPTIONAL
store_redirect_enabled: {{not_installed.store_redirect_enabled}}
ios_store_url: {{not_installed.ios_store_url}} | OPTIONAL
android_store_url: {{not_installed.android_store_url}} | OPTIONAL
2. Unknown Route
unknown_route_rule: {{unknown.route_rule}}
not_found_route_id: {{unknown.not_found_route_id}} | OPTIONAL
3. Invalid Params
invalid_param_rule: {{invalid.param_rule}}
fallback_route_id: {{invalid.fallback_route_id}} | OPTIONAL
4. Expired Links (Optional)
expired_link_rule: {{expired.rule}} | OPTIONAL
expired_link_ux: {{expired.ux}} | OPTIONAL
5. Telemetry
fallback_metric: {{telemetry.fallback_metric}}
fields: {{telemetry.fields}} | OPTIONAL
6. Copy Policy
safe_copy_rules: {{copy.safe_copy_rules}}
support_contact_policy: {{copy.support_contact_policy}} | OPTIONAL
7. References
Scheme/domains: {{xref:MDL-01}}
Deep link map: {{xref:ROUTE-03}} | OPTIONAL
Unknown handling: {{xref:ROUTE-06}} | OPTIONAL
Cross-References
Upstream: {{xref:MDL-01}}, {{xref:ROUTE-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MPUSH-05}} | OPTIONAL
Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define not-installed + unknown/invalid rules + telemetry metric.
advanced: Required. Add deferred deep link + per-env differences and expiry UX.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, web fallback url, store URLs, not_found
route id, fallback route id, expired rules/ux, telemetry fields, support contact, deferred provider
notes, per-env differences, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If not_installed.store_redirect_enabled is UNKNOWN → block Completeness Gate.
If unknown.route_rule is UNKNOWN → block Completeness Gate.
If telemetry.fallback_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MDL
Pass conditions:
required_fields_present == true
not_installed_defined == true
unknown_invalid_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Push Notifications (MPUSH)

Push Notifications (MPUSH)
MPUSH-01 Notification Types Catalog (by notif_id)
MPUSH-02 Payload Contract (fields, routing, localization keys)
MPUSH-03 Permission & Opt-In Rules (platform specific)
MPUSH-04 Delivery/Retry Rules (quiet hours, collapse keys)
MPUSH-05 Deep Link Routing (notif tap behavior)
MPUSH-06 Abuse/Spam Controls for Notifications

MPUSH-01

MPUSH-01 — Notification Types Catalog (by notif_id)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Fallbacks MUST not create open redirects or unsafe navigation.**
- **Unknown routes MUST follow {{xref:ROUTE-06}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Not Installed`
2. `## Unknown Route`
3. `## Invalid Params`
4. `## Expired Links (Optional)`
5. `## Telemetry`
6. `## Copy Policy`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:MDL-01}}, {{xref:ROUTE-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MPUSH-05}} | OPTIONAL**
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
