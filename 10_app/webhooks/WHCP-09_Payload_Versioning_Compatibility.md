# WHCP-09 — Payload Versioning & Compatibility (schema evolution)

## Header Block

| Field | Value |
|---|---|
| template_id | WHCP-09 |
| title | Payload Versioning & Compatibility (schema evolution) |
| type | webhook_payload_versioning_compatibility |
| template_version | 1.0.0 |
| output_path | 10_app/webhooks/WHCP-09_Payload_Versioning_Compatibility.md |
| compliance_gate_id | TMP-05.PRIMARY.WHCP |
| upstream_dependencies | ["WHCP-01", "EVT-02", "IXS-10"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "WHCP-01", "EVT-02", "IXS-10", "WHCP-04"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical payload versioning and compatibility rules for webhooks: how schemas
evolve, how versions are signaled, compatibility windows, breaking change rules, and
migration/rollback strategy. This template must be consistent with event schema versioning and
integration change management policies.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- EVT-02 Event Schema Spec: {{evt.schema_spec}} | OPTIONAL
- IXS-10 Versioning & Change Management: {{ixs.change_mgmt}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Versioning model (semver/date/int/UNKNOWN)
- Where version is carried (header/payload field/path)
- Per-webhook version tracking (webhook_id → current version)
- Backward compatibility rules (what is allowed)
- Breaking change definition
- Deprecation policy (notice period)
- Migration strategy (dual schema support)
- Rollback strategy (version pin, fallback)
- Validation behavior by version (strict/lenient)
- Telemetry requirements (version usage distribution)

## Optional Fields

- Consumer capability negotiation | OPTIONAL
- Schema registry links | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- A breaking change requires a new major version (or explicit breaking bump rule) and a
- migration plan.
- Compatibility window must be explicit; do not support “all old versions forever.”
- Version parsing must be deterministic and validated.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Versioning Model
model: {{version.model}} (semver/date/int/UNKNOWN)
version_location: {{version.location}} (header/payload/path/UNKNOWN)
version_field_or_header: {{version.field_or_header}} | OPTIONAL
2. Per-Webhook Current Versions
Entry
webhook_id: {{current[0].webhook_id}}
current_version: {{current[0].current_version}}
supported_versions: {{current[0].supported_versions}} | OPTIONAL
notes: {{current[0].notes}} | OPTIONAL
(Repeat per webhook.)
3. Compatibility Rules
backward_compatible_changes: {{compat.backward_compatible_changes}}
breaking_changes: {{compat.breaking_changes}}
compat_window_days: {{compat.window_days}}
4. Deprecation Policy
notice_period_days: {{deprec.notice_period_days}}
deprec_process: {{deprec.process}}
sunset_behavior: {{deprec.sunset_behavior}} | OPTIONAL
5. Migration Strategy
dual_version_support: {{migrate.dual_version_support}}
migration_steps: {{migrate.steps}} | OPTIONAL
6. Rollback Strategy
rollback_model: {{rollback.model}} (version_pin/fallback/UNKNOWN)
rollback_steps: {{rollback.steps}} | OPTIONAL
7. Validation Behavior
validation_by_version: {{validate.by_version}}
unknown_version_behavior: {{validate.unknown_version_behavior}}

8. Telemetry
version_usage_metric: {{telemetry.version_usage_metric}}
unknown_version_metric: {{telemetry.unknown_version_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
9. References
Webhook catalog: {{xref:WHCP-01}}
Event schema versioning: {{xref:EVT-02}} | OPTIONAL
Integration change mgmt: {{xref:IXS-10}} | OPTIONAL
Delivery semantics: {{xref:WHCP-04}} | OPTIONAL

## Cross-References

Upstream: {{xref:WHCP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:WHCP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define version model/location and current versions list.
intermediate: Required. Define compat window, deprecation, and unknown version behavior.
advanced: Required. Add migration/rollback steps, capability negotiation, and telemetry fields
rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, version field/header, supported versions,
notes, sunset behavior, migration/rollback steps, unknown version metric/fields, capability
negotiation, schema registry links, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If version.model is UNKNOWN → block Completeness Gate.
If version.location is UNKNOWN → block Completeness Gate.
If compat.window_days is UNKNOWN → block Completeness Gate.
If validate.unknown_version_behavior is UNKNOWN → block Completeness Gate.
If telemetry.version_usage_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
version_model_and_location_defined == true
per_webhook_versions_defined == true
compat_and_deprecation_defined == true
unknown_version_handling_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
