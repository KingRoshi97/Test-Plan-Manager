# FMS-09 — Migration & Backfill Plan (moving buckets, rehash)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-09                                             |
| Template Type     | Integration / File & Media Storage                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring migration & backfill plan (moving buckets, rehash)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Migration & Backfill Plan (moving buckets, rehash) Document                         |

## 2. Purpose

Define the canonical plan for migrating stored files/media (bucket moves, key renames,
encryption changes, re-hashing) and executing backfills safely, with auditability and rollback.
This template must be consistent with retention/access rules and change management policies.

## 3. Inputs Required

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

## 4. Required Fields

Migration scope (what is moving/changing)
Source/target bucket_ids
Key rename rules (if any)
Re-encryption / KMS change rules (if any)
Re-hash rules (if any)
Backfill strategy (copy, verify, switch)
Verification strategy (checksums, counts)
Cutover strategy (dual read, version pin)
Rollback strategy
Safety limits (time windows, max objects)
Audit logging requirements (who ran migration)
Telemetry requirements (progress, errors)

Optional Fields
User-visible impact notes | OPTIONAL
Cost estimation notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Migrations must not violate retention or access control rules.
Verification must be explicit (checksums/counts), not “looks good.”
Rollback must be possible or explicitly documented as not possible.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
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
Cross-References
Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define source/target buckets, steps, verification checks, rollback rule.
intermediate: Required. Define cutover/dual read and safety limits and audit fields.
advanced: Required. Add crypto/rehash details, cost/impact notes, and telemetry rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, objects in scope, rename/crypto/hash
sections, thresholds, max objects, audit fields, error metric, impact/cost notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If buckets.source is UNKNOWN → block Completeness Gate.
If buckets.target is UNKNOWN → block Completeness Gate.
If verify.checks is UNKNOWN → block Completeness Gate.
If rollback.rule is UNKNOWN → block Completeness Gate.
If telemetry.progress_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
source_and_target_defined == true
backfill_and_verification_defined == true
cutover_and_rollback_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

FMS-10

FMS-10 — Observability & Cost Controls (storage growth, egress)
Header Block

## 5. Optional Fields

User-visible impact notes | OPTIONAL
Cost estimation notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Migrations must not violate retention or access control rules.**
- **Verification must be explicit (checksums/counts), not “looks good.”**
- **Rollback must be possible or explicitly documented as not possible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Scope`
2. `## Source/Target`
3. `## Key/Path Changes`
4. `## Crypto Changes`
5. `## Re-Hash`
6. `## Backfill Strategy`
7. `## Verification`
8. `## Cutover / Rollback`
9. `## Safety Limits`
10. `## Audit / Telemetry`

## 8. Cross-References

- **Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FMS-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
