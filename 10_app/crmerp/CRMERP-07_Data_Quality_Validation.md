# CRMERP-07 — Data Quality & Validation (required fields, dedupe)

## Header Block

| Field | Value |
|---|---|
| template_id | CRMERP-07 |
| title | Data Quality & Validation (required fields, dedupe) |
| type | crmerp_data_quality_validation |
| template_version | 1.0.0 |
| output_path | 10_app/crmerp/CRMERP-07_Data_Quality_Validation.md |
| compliance_gate_id | TMP-05.PRIMARY.CRMERP |
| upstream_dependencies | ["CRMERP-02", "IXS-05", "DQV-03"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "CRMERP-01", "CRMERP-02", "IXS-05", "DQV-03", "API-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical data quality and validation rules for CRM/ERP sync: required fields,
schema validation, normalization, deduplication, and how invalid records are handled
(reject/quarantine/repair). This template must be consistent with mapping rules and canonical
validation standards and must not invent data fields beyond upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-02 Object/Entity Mapping: {{crmerp.mapping}}
- IXS-05 Data Mapping & Transforms: {{ixs.data_mapping}} | OPTIONAL
- DQV-03 Data Validation Rules: {{dqv.rules}} | OPTIONAL
- API-03 Error/Status Code Policy: {{api.error_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- system_id binding
- Validation stages (ingest, transform, pre-write, post-write)
- Per-object required field rules (external_object → required fields)
- Schema validation rules (canonical schema binding)
- Normalization rules (strings, dates, units)
- Deduplication keys and window
- Invalid record handling (reject/quarantine/repair)
- Data repair workflow (operator actions)
- Telemetry requirements (invalid rate, dedupe hits)
- Audit requirements for repairs

## Optional Fields

- Sampling/quality reporting cadence | OPTIONAL
- PII redaction during validation | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Required fields must be explicit and consistent with canonical schemas.
- Deduplication rules must be deterministic; avoid fuzzy matching unless defined.
- Invalid records must not silently pass into system-of-record.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Validation Stages
system_id: {{meta.system_id}}
stages: {{stages.list}}
2. Required Fields (Per Object)
Rule
external_object: {{required[0].external_object}}
required_fields: {{required[0].required_fields}}
missing_field_behavior: {{required[0].missing_field_behavior}}
notes: {{required[0].notes}} | OPTIONAL
(Repeat per object.)
3. Schema Validation
schema_binding_ref: {{schema.ref}} (expected: {{xref:DATA-06}}/{{xref:DQV-03}}) |
OPTIONAL
validation_method: {{schema.method}} (strict/lenient/UNKNOWN)
on_validation_fail: {{schema.on_fail}}
4. Normalization
string_rules: {{norm.string_rules}} | OPTIONAL
date_time_rules: {{norm.date_time_rules}} | OPTIONAL
unit_rules: {{norm.unit_rules}} | OPTIONAL
5. Deduplication
dedupe_keys: {{dedupe.keys}}
dedupe_window: {{dedupe.window}} | OPTIONAL
dedupe_behavior: {{dedupe.behavior}} (drop/merge/quarantine/UNKNOWN)
6. Invalid Record Handling
invalid_behavior: {{invalid.behavior}} (reject/quarantine/repair/UNKNOWN)
quarantine_location: {{invalid.quarantine_location}} | OPTIONAL
repair_allowed: {{invalid.repair_allowed}} | OPTIONAL

7. Repair Workflow
operator_actions: {{repair.operator_actions}}
audit_required: {{repair.audit_required}}
8. Telemetry
invalid_record_metric: {{telemetry.invalid_record_metric}}
dedupe_hit_metric: {{telemetry.dedupe_hit_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
9. Audit
audit_fields: {{audit.fields}} | OPTIONAL
retention_policy: {{audit.retention_policy}} | OPTIONAL
10.References
System inventory: {{xref:CRMERP-01}}
Object/entity mapping: {{xref:CRMERP-02}}
Data mapping: {{xref:IXS-05}} | OPTIONAL
Validation rules: {{xref:DQV-03}} | OPTIONAL
Reconciliation/backfills: {{xref:CRMERP-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:CRMERP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:CRMERP-08}}, {{xref:CRMERP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define required fields and invalid behavior and a dedupe key list.
intermediate: Required. Define validation stages, schema method, and repair workflow/audit.
advanced: Required. Add normalization rules, reporting cadence, and PII-safe validation
handling.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, schema ref, normalization rules,
dedupe window, quarantine location, repair allowed, telemetry fields, audit fields/retention,
cadence/pii handling, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If stages.list is UNKNOWN → block Completeness Gate.
If required list is UNKNOWN → block Completeness Gate.
If schema.on_fail is UNKNOWN → block Completeness Gate.
If invalid.behavior is UNKNOWN → block Completeness Gate.
If telemetry.invalid_record_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
validation_stages_defined == true

required_fields_per_object_defined == true
dedupe_defined == true
invalid_handling_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
