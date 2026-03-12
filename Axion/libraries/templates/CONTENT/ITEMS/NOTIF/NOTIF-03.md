# NOTIF-03 — Template & Localization Mapping (template_id, variables)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-03                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring template & localization mapping (template_id, variables)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Template & Localization Mapping (template_id, variables) Document                         |

## 2. Purpose

Define the canonical mapping from notification types to message templates and localization
assets: template identifiers per channel/provider, required variables, default language, fallback
behavior, and validation rules. This template must be consistent with payload contracts and
must not invent template IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- MPUSH-02 Payload Contract (push copy keys): {{mpush.payload_contract}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Template registry (template_id list)
template_id (stable identifier)
notification type binding (notif_id or internal notification name)
channel binding (email/sms/push/in_app)
provider binding (provider_id)
template reference (provider template key/id)
required variables list
localization keys (title/body keys or template keys)
supported locales list
fallback locale rule
missing variable handling rule
template validation rule (pre-send checks)
telemetry requirements (template render failures)

Optional Fields
A/B variant support | OPTIONAL
Per-tenant branding overrides | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not invent template_ids; use upstream registry if present, else mark UNKNOWN and flag.
Variables must be explicit; no “dynamic” without a list.
Missing required variables MUST fail or use explicit defaults; no silent blanks.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Template Registry Summary
total_templates: {{templates.total}}
channels_covered: {{templates.channels_covered}} | OPTIONAL
notes: {{templates.notes}} | OPTIONAL
2. Template Entries (by template_id)
Template

## 5. Optional Fields

A/B variant support | OPTIONAL
Per-tenant branding overrides | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent template_ids; use upstream registry if present, else mark UNKNOWN and flag.
- **Variables must be explicit; no “dynamic” without a list.**
- **Missing required variables MUST fail or use explicit defaults; no silent blanks.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Template Registry Summary`
2. `## Template Entries (by template_id)`
3. `## Template`

## 8. Cross-References

- **Upstream**: Canonical Spec (CAN-01), Intake Submission (INT-01)
- **Downstream**: Related Integrations & External Services templates
- **Entity Types Referenced**: As defined in canonical spec

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
