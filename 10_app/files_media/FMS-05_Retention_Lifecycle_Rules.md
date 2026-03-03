# FMS-05 — Retention & Lifecycle Rules (TTL, archival, deletion)

## Header Block

| Field | Value |
|---|---|
| template_id | FMS-05 |
| title | Retention & Lifecycle Rules (TTL, archival, deletion) |
| type | files_media_retention_lifecycle_rules |
| template_version | 1.0.0 |
| output_path | 10_app/files_media/FMS-05_Retention_Lifecycle_Rules.md |
| compliance_gate_id | TMP-05.PRIMARY.FMS |
| upstream_dependencies | ["FMS-01", "FMS-06", "FPMP-06"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "FMS-01", "FMS-02", "FMS-06", "FPMP-06"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical retention, lifecycle, and deletion rules for stored files/media: TTLs by class,
archival policies, deletion propagation, and legal/PII constraints. This template must be
consistent with file security/compliance rules and must not invent retention obligations without
upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Provider Inventory: {{fms.storage_inventory}}
- FMS-02 Upload/Download Spec: {{fms.upload_download}} | OPTIONAL
- FMS-06 Security/Compliance for Files: {{fms.security}} | OPTIONAL
- FPMP-06 Security & Compliance for Files: {{fpmp.file_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- File classification model (public/private/pii/UNKNOWN)
- Retention policy per class (ttl_days or permanent)
- Archival policy (when/how)
- Deletion policy (who can delete, how)
- Deletion propagation rule (variants, CDN caches)
- Legal hold rule (if applicable)
- Secure delete expectations (if applicable)
- Telemetry requirements (storage growth, deletions)
- Audit requirements (deletion events)

## Optional Fields

- Per-bucket overrides | OPTIONAL
- User export/download policy | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Retention must be explicit; avoid “forever” unless justified.
- Deletion must propagate to derived variants and caches per rule.
- Legal holds must override deletion/TTL when enabled.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Classification Model
classes: {{class.model}}
definitions: {{class.definitions}} | OPTIONAL
2. Retention by Class
Policy
class: {{retention[0].class}}
ttl_days: {{retention[0].ttl_days}}
archive_after_days: {{retention[0].archive_after_days}} | OPTIONAL
notes: {{retention[0].notes}} | OPTIONAL
(Repeat per class.)
3. Deletion Policy
who_can_delete: {{delete.who_can_delete}}
delete_method: {{delete.method}} (soft/hard/UNKNOWN)
delete_propagation_rule: {{delete.propagation_rule}}
4. Legal Hold
legal_hold_supported: {{hold.supported}}
hold_rule: {{hold.rule}} | OPTIONAL
5. Secure Delete
secure_delete_required: {{secure.required}} | OPTIONAL
secure_delete_rule: {{secure.rule}} | OPTIONAL
6. Telemetry
storage_growth_metric: {{telemetry.storage_growth_metric}}
deletions_metric: {{telemetry.deletions_metric}} | OPTIONAL
7. Audit
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
8. References
Storage inventory: {{xref:FMS-01}}
Upload/download: {{xref:FMS-02}} | OPTIONAL
CDN purge rules: {{xref:FMS-04}} | OPTIONAL

Security/compliance: {{xref:FMS-06}} | OPTIONAL
File security baseline: {{xref:FPMP-06}} | OPTIONAL

## Cross-References

Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define retention TTLs and deletion propagation rule.
intermediate: Required. Define archival and audit/telemetry rules.
advanced: Required. Add legal hold and secure delete and per-bucket overrides.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, archive after days, notes,
hold/secure rules, deletions metric, audit fields, overrides/export policy, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If class.model is UNKNOWN → block Completeness Gate.
If delete.propagation_rule is UNKNOWN → block Completeness Gate.
If telemetry.storage_growth_metric is UNKNOWN → block Completeness Gate.
If audit.required is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
classification_and_ttls_defined == true
deletion_and_propagation_defined == true
telemetry_defined == true
audit_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
