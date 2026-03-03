# FMS-08 — Metadata & Indexing (search, tags, EXIF policy)

## Header Block

| Field | Value |
|---|---|
| template_id | FMS-08 |
| title | Metadata & Indexing (search, tags, EXIF policy) |
| type | files_media_metadata_indexing |
| template_version | 1.0.0 |
| output_path | 10_app/files_media/FMS-08_Metadata_Indexing.md |
| compliance_gate_id | TMP-05.PRIMARY.FMS |
| upstream_dependencies | ["FMS-02", "DATA-06", "PFS-01"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "FMS-02", "DATA-06", "PFS-01", "FPMP-03", "FMS-06"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical metadata model for files/media and how that metadata is
indexed/searchable: tag fields, searchable facets, EXIF extraction/stripping policy, and privacy
constraints. This template must be consistent with canonical schemas and query contracts.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-02 Upload/Download Spec: {{fms.upload_download}}
- DATA-06 Canonical Schemas (file metadata): {{data.schemas}} | OPTIONAL
- PFS-01 Query Contract (filters/sorts): {{pfs.query_contract}} | OPTIONAL
- FPMP-03 Processing Stages (metadata extraction): {{fpmp.stages}} | OPTIONAL
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Metadata entity/schema ref (file_metadata schema)
- Core metadata fields list (size, type, hash, owner, created_at)
- Tagging model (user tags/system tags)
- Search/index fields list (allowed filter/sort fields)
- EXIF policy (strip/retain/UNKNOWN)
- Derived metadata extraction rules (dimensions, duration)
- PII policy for metadata (no GPS unless allowed)
- Index update rules (on upload/process/delete)
- Telemetry requirements (index lag, extraction failures)

## Optional Fields

- Full-text search support | OPTIONAL
- Versioning of metadata schema | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- EXIF and other embedded metadata must be handled explicitly; default to stripping sensitive
- fields unless approved.
- Only allow filtering/sorting on indexed fields per PFS contract; reject unsupported queries.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Schema Binding
metadata_schema_ref: {{schema.ref}} (expected: {{xref:DATA-06}}) | OPTIONAL
2. Core Fields
core_fields: {{fields.core}}
3. Tags
tag_model: {{tags.model}} (user_tags/system_tags/UNKNOWN)
allowed_tag_fields: {{tags.allowed_fields}} | OPTIONAL
4. Search / Index
indexed_fields: {{index.fields}}
filterable_fields: {{index.filterable_fields}}
sortable_fields: {{index.sortable_fields}} | OPTIONAL
5. EXIF & Embedded Metadata
exif_policy: {{exif.policy}} (strip/retain/UNKNOWN)
fields_stripped: {{exif.fields_stripped}} | OPTIONAL
fields_retained: {{exif.fields_retained}} | OPTIONAL
6. Derived Metadata Extraction
extraction_rules: {{derive.rules}}
processor_ref: {{derive.processor_ref}} (expected: {{xref:FPMP-03}}) | OPTIONAL
7. Index Update Rules
on_upload: {{update.on_upload}}
on_process_complete: {{update.on_process_complete}} | OPTIONAL
on_delete: {{update.on_delete}}
8. PII Policy
pii_forbidden_fields: {{pii.forbidden_fields}}
gps_policy: {{pii.gps_policy}} | OPTIONAL
9. Telemetry
index_lag_metric: {{telemetry.index_lag_metric}}
extraction_failure_metric: {{telemetry.extraction_failure_metric}} | OPTIONAL
10.References
Query contract: {{xref:PFS-01}} | OPTIONAL
Upload/download: {{xref:FMS-02}}
Processing stages: {{xref:FPMP-03}} | OPTIONAL
Security/compliance: {{xref:FMS-06}} | OPTIONAL

## Cross-References

Upstream: {{xref:FMS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-09}}, {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define core fields and EXIF policy and index fields list.
intermediate: Required. Define update rules and derived extraction and PII forbidden fields.
advanced: Required. Add full-text/versioning and strict filter/sort enforcement and telemetry
rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, schema ref, allowed tag fields, sortable
fields, exif strip/retain lists, processor ref, optional update step, gps policy, extraction failure
metric, full-text/versioning, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If fields.core is UNKNOWN → block Completeness Gate.
If index.fields is UNKNOWN → block Completeness Gate.
If exif.policy is UNKNOWN → block Completeness Gate.
If update.on_delete is UNKNOWN → block Completeness Gate.
If telemetry.index_lag_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
core_fields_defined == true
index_fields_defined == true
exif_and_pii_policies_defined == true
update_rules_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
