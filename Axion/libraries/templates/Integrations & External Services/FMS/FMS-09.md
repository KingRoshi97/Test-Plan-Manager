# FMS-09 — File Management Observability (storage metrics, costs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-09                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring file management observabi |
| Filled By         | Internal Agent                                   |
| Consumes          | FMS-01, FMS-05, IXS-10                           |
| Produces          | Filled File Management Observability (storage met|

## 2. Purpose

Define the canonical plan for migrating stored files/media (bucket moves, key renames, encryption changes, re-hashing) and executing backfills safely, with auditability and rollback. This template must be consistent with retention/access rules and change management policies.

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

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Migration scope (what is  | spec         | No              |
| Source/target bucket_ids  | spec         | No              |
| Key rename rules (if any) | spec         | No              |
| Re-encryption / KMS chang | spec         | No              |
| Re-hash rules (if any)    | spec         | No              |
| Backfill strategy (copy,  | spec         | No              |
| Verification strategy (ch | spec         | No              |
| Cutover strategy (dual re | spec         | No              |
| Rollback strategy         | spec         | No              |
| Safety limits (time windo | spec         | No              |
| Audit logging requirement | spec         | No              |
| Telemetry requirements (p | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| User-visible impact notes | spec         | Enrichment only, no new truth  |
| Cost estimation notes     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Migrations must not violate retention or access control rules.
- Verification must be explicit (checksums/counts), not “looks good.”
- Rollback must be possible or explicitly documented as not possible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## File Management Observability (storage metrics, costs)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FMS-10}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, objects in scope, rename/crypto/hash
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If buckets.source is UNKNOWN → block Completeness Gate.
- If buckets.target is UNKNOWN → block Completeness Gate.
- If verify.checks is UNKNOWN → block Completeness Gate.
- If rollback.rule is UNKNOWN → block Completeness Gate.
- If telemetry.progress_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] source_and_target_defined == true
- [ ] backfill_and_verification_defined == true
- [ ] cutover_and_rollback_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-10
