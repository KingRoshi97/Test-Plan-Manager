# NOTIF-03 — Template & Localization Mapping (template_id, variables)

## Header Block

| Field | Value |
|---|---|
| template_id | NOTIF-03 |
| title | Template & Localization Mapping (template_id, variables) |
| type | notifications_template_localization_mapping |
| template_version | 1.0.0 |
| output_path | 10_app/notifications/NOTIF-03_Template_Localization_Mapping.md |
| compliance_gate_id | TMP-05.PRIMARY.NOTIF |
| upstream_dependencies | ["NOTIF-01", "NOTIF-02", "MPUSH-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "NOTIF-01", "NOTIF-02", "MPUSH-02", "FFCFG-01"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical mapping from notification types to message templates and localization
assets: template identifiers per channel/provider, required variables, default language, fallback
behavior, and validation rules. This template must be consistent with payload contracts and
must not invent template IDs beyond upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- MPUSH-02 Payload Contract (push copy keys): {{mpush.payload_contract}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Template registry (template_id list)
- template_id (stable identifier)
- notification type binding (notif_id or internal notification name)
- channel binding (email/sms/push/in_app)
- provider binding (provider_id)
- template reference (provider template key/id)
- required variables list
- localization keys (title/body keys or template keys)
- supported locales list
- fallback locale rule
- missing variable handling rule
- template validation rule (pre-send checks)
- telemetry requirements (template render failures)

## Optional Fields

- A/B variant support | OPTIONAL
- Per-tenant branding overrides | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent template_ids; use upstream registry if present, else mark UNKNOWN and flag.
- Variables must be explicit; no “dynamic” without a list.
- Missing required variables MUST fail or use explicit defaults; no silent blanks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Template Registry Summary
total_templates: {{templates.total}}
channels_covered: {{templates.channels_covered}} | OPTIONAL
notes: {{templates.notes}} | OPTIONAL
2. Template Entries (by template_id)
Template
template_id: {{items[0].template_id}}
notif_binding: {{items[0].notif_binding}}
channel: {{items[0].channel}}
provider_id: {{items[0].provider_id}}
provider_template_ref: {{items[0].provider_template_ref}}
required_variables: {{items[0].required_variables}}
localization:
supported_locales: {{items[0].locales.supported}}
default_locale: {{items[0].locales.default}}
fallback_locale_rule: {{items[0].locales.fallback_rule}}
missing_var_behavior: {{items[0].missing_var_behavior}}
validation_rule: {{items[0].validation_rule}}
ab_variant: {{items[0].ab_variant}} | OPTIONAL
branding_override: {{items[0].branding_override}} | OPTIONAL
open_questions:
{{items[0].open_questions[0]}} | OPTIONAL
(Repeat per template_id.)
3. Telemetry
render_failure_metric: {{telemetry.render_failure_metric}}
fields: {{telemetry.fields}} | OPTIONAL
4. References
Channel inventory: {{xref:NOTIF-01}}
Provider inventory: {{xref:NOTIF-02}} | OPTIONAL

Push payload/copy keys: {{xref:MPUSH-02}} | OPTIONAL
Send policy: {{xref:NOTIF-04}} | OPTIONAL

## Cross-References

Upstream: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-04}}, {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define template entries and required variables and fallback locale rule.
intermediate: Required. Define validation rule and missing var behavior and render failure
metric.
advanced: Required. Add A/B variants and branding overrides with strict traceability.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, channels covered, ab variant,
branding override, telemetry fields, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If items[].template_id is UNKNOWN → block Completeness Gate.
If items[].required_variables is UNKNOWN → block Completeness Gate.
If items[*].locales.fallback_rule is UNKNOWN → block Completeness Gate.
If telemetry.render_failure_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
template_ids_unique == true
channel_and_provider_bindings_valid == true
variable_lists_defined == true
localization_fallback_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
