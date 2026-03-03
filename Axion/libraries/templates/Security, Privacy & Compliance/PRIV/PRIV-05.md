# PRIV-05 — Data Minimization Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-05                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring data minimization rules   |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-01, FMS-05, COMP-06                         |
| Produces          | Filled Data Minimization Rules                   |

## 2. Purpose

Define the canonical retention and deletion policy for user and system data: TTLs by data class, deletion workflows (including DSAR/data deletion requests), legal hold behavior, and deletion propagation to files, caches, and derived data. This template must align with storage lifecycle rules and compliance requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- File retention/lifecycle: {{xref:FMS-05}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Data repair/backfill procedures: {{xref:ADMIN-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Retention classes list (class_id list) | No |
| Retention TTLs by data_class/entity | No |
| Deletion request types (account delete, DSAR erase) | No |
| Deletion execution workflow (steps) | No |
| Propagation rules (db, files, caches, indexes) | No |
| Legal hold supported (yes/no/UNKNOWN) | Yes |
| Legal hold override rule | No |
| Verification rule (prove deletion completed) | No |
| Audit requirements (deletion events) | No |
| Telemetry requirements (deletions completed, backlog) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Export (DSAR access) rules | OPTIONAL |
| Backups deletion policy | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Deletion must propagate to derived data and files per rules.
- Legal hold must override deletion/TTL when enabled.
- Verification must be explicit (counts/checks).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PRIV-09}}, {{xref:COMP-09}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define TTLs, deletion workflow steps, and propagation. |
| Intermediate | Required. Define legal hold and verification and audit events. |
| Advanced | Required. Add backups/export policy and strict telemetry/backlog management. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, notes, evidence artifact rule, audit events, backlog metric, export/backup policies, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If retention.classes is UNKNOWN → block Completeness Gate.
- If delete.steps[0] is UNKNOWN → block Completeness Gate.
- If prop.rules is UNKNOWN → block Completeness Gate.
- If hold.override_rule is UNKNOWN → block Completeness Gate (when hold.supported == true).
- If telemetry.completed_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.PRIV
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] ttls_defined == true
- [ ] deletion_and_propagation_defined == true
- [ ] legal_hold_and_verification_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

