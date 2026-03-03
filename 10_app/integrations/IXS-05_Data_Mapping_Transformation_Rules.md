# IXS-05 — Data Mapping & Transformation Rules (field maps, normalization)

## Header Block

| Field | Value |
|---|---|
| template_id | IXS-05 |
| title | Data Mapping & Transformation Rules (field maps, normalization) |
| type | integration_data_mapping_transforms |
| template_version | 1.0.0 |
| output_path | 10_app/integrations/IXS-05_Data_Mapping_Transformation_Rules.md |
| compliance_gate_id | TMP-05.PRIMARY.IXS |
| upstream_dependencies | ["IXS-02", "DATA-06", "DQV-03"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-02", "DATA-06", "DQV-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical mapping between external system fields and internal schemas/entities,
including transforms/normalization, validation rules, defaulting, and error handling for unmapped
or invalid data. This template must be consistent with canonical data schemas and must not
invent schema fields beyond upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-02 Integration Specs: {{ixs.integration_specs}}
- DATA-06 Canonical Data Schemas: {{data.schemas}} | OPTIONAL
- DQV-03 Data Validation Rules: {{data.validation_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- integration_id binding
- Mapping registry (map_id list)
- map_id (stable identifier)
- external object name (vendor object/event)
- internal schema/entity ref (schema_ref/entity_id)
- primary key mapping (external id → internal id)
- field mapping list (external_field → internal_path)
- transform rules (trim, case, units, timezone)
- defaulting rules (missing values)
- validation binding (DQV-03 / schema constraints)
- unknown/unmapped field policy
- PII handling rules (redaction/storage constraints)

## Optional Fields

- Bidirectional mapping notes | OPTIONAL
- Enum mapping tables | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent schema paths; use only valid refs from {{xref:DATA-06}}.
- Transform rules must be deterministic (same input → same output).
- Unmapped required fields MUST cause explicit failure or explicit defaulting; no silent drops.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Mapping Registry Summary
integration_id: {{meta.integration_id}}
total_maps: {{meta.total_maps}}
notes: {{meta.notes}} | OPTIONAL
2. Map Entry (repeat per map_id)
Map
map_id: {{maps[0].map_id}}
external_object: {{maps[0].external_object}}
internal_ref: {{maps[0].internal_ref}} (schema_ref/entity_id)
primary_key_map: {{maps[0].primary_key_map}}
fields:
● external_field: {{maps[0].fields[0].external_field}}
internal_path: {{maps[0].fields[0].internal_path}}
required: {{maps[0].fields[0].required}} | OPTIONAL
transform: {{maps[0].fields[0].transform}} | OPTIONAL
default: {{maps[0].fields[0].default}} | OPTIONAL
validation_ref: {{maps[0].fields[0].validation_ref}} | OPTIONAL
(Repeat field blocks; repeat map blocks.)
3. Transform Rules (Global)
timezone_rule: {{transform.timezone_rule}} | OPTIONAL
unit_normalization_rule: {{transform.unit_rule}} | OPTIONAL
string_normalization_rule: {{transform.string_rule}} | OPTIONAL
4. Validation Binding
schema_first_or_mapping_first: {{validation.source_of_truth}}
(schema-first/mapping-first/UNKNOWN)
dqv_ref: {{validation.dqv_ref}} (expected: {{xref:DQV-03}}) | OPTIONAL

5. Unknown/Unmapped Policy
unknown_field_behavior: {{unknown.unknown_field_behavior}}
(ignore/fail/store_raw/UNKNOWN)
unmapped_required_behavior: {{unknown.unmapped_required_behavior}}
6. PII Handling
pii_fields: {{pii.fields}} | OPTIONAL
redaction_rule: {{pii.redaction_rule}}
storage_constraints: {{pii.storage_constraints}} | OPTIONAL
7. References
Integration spec: {{xref:IXS-02}}
Canonical data schemas: {{xref:DATA-06}} | OPTIONAL
Data validation rules: {{xref:DQV-03}} | OPTIONAL
Security/compliance: {{xref:IXS-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-02}}, {{xref:DATA-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-06}}, {{xref:IXS-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define map entries and core field mappings; use UNKNOWN for optional
transforms.
intermediate: Required. Add deterministic transforms and validation bindings.
advanced: Required. Add enum tables, bidirectional notes, and strict unmapped handling.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, field
required/transform/default/validation refs, global transform rules, dqv ref, pii fields, storage
constraints, enum tables, bidirectional notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If meta.integration_id is UNKNOWN → block Completeness Gate.
If maps[*].internal_ref is UNKNOWN → block Completeness Gate.
If unknown.unmapped_required_behavior is UNKNOWN → block Completeness Gate.
If pii.redaction_rule is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:
required_fields_present == true
map_ids_unique == true
integration_id_exists_in_inventory == true
all internal_path references are valid (DATA-06)
unmapped_required_behavior_defined == true

pii_handling_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
