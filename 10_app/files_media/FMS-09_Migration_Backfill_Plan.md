# FMS-09 — Migration & Backfill Plan (moving buckets, rehash)

## Header Block

| Field | Value |
|---|---|
| template_id | FMS-09 |
| title | Migration & Backfill Plan (moving buckets, rehash) |
| type | files_media_migration_backfill_plan |
| template_version | 1.0.0 |
| output_path | 10_app/files_media/FMS-09_Migration_Backfill_Plan.md |
| compliance_gate_id | TMP-05.PRIMARY.FMS |
| upstream_dependencies | ["FMS-01", "FMS-05", "IXS-10"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "FMS-01", "FMS-05", "FMS-07", "IXS-10", "ADMIN-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical plan for migrating stored files/media (bucket moves, key renames,
encryption changes, re-hashing) and executing backfills safely, with auditability and rollback.
This template must be consistent with retention/access rules and change management policies.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Inventory: {{fms.storage_inventory}}
- FMS-05 Retention/Lifecycle Rules: {{fms.retention}} | OPTIONAL
- FMS-07 Access Control Model: {{fms.access_control}} | OPTIONAL
- IXS-10 Change Management: {{ixs.change_mgmt}} | OPTIONAL
- ADMIN-03 Audit Trail: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Migration scope (what is moving/changing)
- Source/target bucket_ids
- Key rename rules (if any)
- Re-encryption / KMS change rules (if any)
- Re-hash rules (if any)
- Backfill strategy (copy, verify, switch)
- Verification strategy (checksums, counts)
- Cutover strategy (dual read, version pin)
- Rollback strategy
- Safety limits (time windows, max objects)
- Audit logging requirements (who ran migration)
- Telemetry requirements (progress, errors)

## Optional Fields

- User-visible impact notes | OPTIONAL
- Cost estimation notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Migrations must not violate retention or access control rules.
- Verification must be explicit (checksums/counts), not “looks good.”
- Rollback must be possible or explicitly documented as not possible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Scope
scope: {{scope.statement}}
objects_in_scope: {{scope.objects_in_scope}} | OPTIONAL
2. Source/Target
source_bucket_id: {{buckets.source}}
target_bucket_id: {{buckets.target}}
3. Key/Path Changes
key_rename_rule: {{keys.rename_rule}} | OPTIONAL
4. Crypto Changes
reencrypt_supported: {{crypto.reencrypt_supported}} | OPTIONAL
kms_change_rule: {{crypto.kms_change_rule}} | OPTIONAL
5. Re-Hash
rehash_supported: {{hash.rehash_supported}} | OPTIONAL
rehash_rule: {{hash.rehash_rule}} | OPTIONAL
6. Backfill Strategy
method: {{backfill.method}} (copy_verify_switch/UNKNOWN)
steps: {{backfill.steps}}
dual_read_supported: {{backfill.dual_read_supported}} | OPTIONAL
7. Verification
verification_checks: {{verify.checks}}
acceptance_thresholds: {{verify.thresholds}} | OPTIONAL
8. Cutover / Rollback
cutover_rule: {{cutover.rule}}
rollback_rule: {{rollback.rule}}
9. Safety Limits
time_window_rule: {{safety.time_window_rule}}
max_objects_rule: {{safety.max_objects_rule}} | OPTIONAL
10.Audit / Telemetry
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL

progress_metric: {{telemetry.progress_metric}}
error_metric: {{telemetry.error_metric}} | OPTIONAL
11.References
Storage inventory: {{xref:FMS-01}}
Access control: {{xref:FMS-07}} | OPTIONAL
Retention/lifecycle: {{xref:FMS-05}} | OPTIONAL
Change management: {{xref:IXS-10}} | OPTIONAL
Observability/runbooks: {{xref:FMS-10}} | OPTIONAL

## Cross-References

Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define source/target buckets, steps, verification checks, rollback rule.
intermediate: Required. Define cutover/dual read and safety limits and audit fields.
advanced: Required. Add crypto/rehash details, cost/impact notes, and telemetry rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, objects in scope, rename/crypto/hash
sections, thresholds, max objects, audit fields, error metric, impact/cost notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If buckets.source is UNKNOWN → block Completeness Gate.
If buckets.target is UNKNOWN → block Completeness Gate.
If verify.checks is UNKNOWN → block Completeness Gate.
If rollback.rule is UNKNOWN → block Completeness Gate.
If telemetry.progress_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
source_and_target_defined == true
backfill_and_verification_defined == true
cutover_and_rollback_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
