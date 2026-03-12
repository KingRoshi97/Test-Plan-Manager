# PRIV-05 — Retention & Deletion Policy (TTL, DSAR, legal hold)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-05                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring retention & deletion policy (ttl, dsar, legal hold)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Retention & Deletion Policy (TTL, DSAR, legal hold) Document                         |

## 2. Purpose

Define the canonical retention and deletion policy for user and system data: TTLs by data class,
deletion workflows (including DSAR/data deletion requests), legal hold behavior, and deletion
propagation to files, caches, and derived data. This template must align with storage lifecycle
rules and compliance requirements.

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

Retention classes list (class_id list)
Retention TTLs by data_class/entity
Deletion request types (account delete, DSAR erase)
Deletion execution workflow (steps)
Propagation rules (db, files, caches, indexes)
Legal hold supported (yes/no/UNKNOWN)
Legal hold override rule
Verification rule (prove deletion completed)
Audit requirements (deletion events)
Telemetry requirements (deletions completed, backlog)

Optional Fields
Export (DSAR access) rules | OPTIONAL
Backups deletion policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Deletion must propagate to derived data and files per rules.
Legal hold must override deletion/TTL when enabled.
Verification must be explicit (counts/checks).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Retention Classes
classes: {{retention.classes}}
2. TTLs
Policy
data_class: {{ttls[0].data_class}}
entity_name: {{ttls[0].entity_name}}
ttl_days: {{ttls[0].ttl_days}}
notes: {{ttls[0].notes}} | OPTIONAL
(Repeat per policy.)
3. Deletion Request Types
types: {{delete.types}}
4. Deletion Workflow
steps:
{{delete.steps[0]}}
{{delete.steps[1]}}
{{delete.steps[2]}} | OPTIONAL
5. Propagation
propagation_rules: {{prop.rules}}
file_ref: {{xref:FMS-05}} | OPTIONAL
6. Legal Hold
supported: {{hold.supported}}
override_rule: {{hold.override_rule}}
7. Verification
verification_rule: {{verify.rule}}
evidence_artifact_rule: {{verify.evidence_artifact_rule}} | OPTIONAL
8. Audit
audit_required: {{audit.required}}
audit_events: {{audit.events}} | OPTIONAL

9. Telemetry
deletion_completed_metric: {{telemetry.completed_metric}}
deletion_backlog_metric: {{telemetry.backlog_metric}} | OPTIONAL
10.References
Data inventory: {{xref:PRIV-01}} | OPTIONAL
Consent model: {{xref:PRIV-04}} | OPTIONAL
File lifecycle: {{xref:FMS-05}} | OPTIONAL
Compliance requirements: {{xref:COMP-06}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PRIV-09}}, {{xref:COMP-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define TTLs, deletion workflow steps, and propagation.
intermediate: Required. Define legal hold and verification and audit events.
advanced: Required. Add backups/export policy and strict telemetry/backlog management.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, evidence artifact rule, audit
events, backlog metric, export/backup policies, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If retention.classes is UNKNOWN → block Completeness Gate.
If delete.steps[0] is UNKNOWN → block Completeness Gate.
If prop.rules is UNKNOWN → block Completeness Gate.
If hold.override_rule is UNKNOWN → block Completeness Gate (when hold.supported == true).
If telemetry.completed_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PRIV
Pass conditions:
required_fields_present == true
ttls_defined == true
deletion_and_propagation_defined == true
legal_hold_and_verification_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PRIV-06

PRIV-06 — Data Sharing Map (internal/external recipients)
Header Block

## 5. Optional Fields

Export (DSAR access) rules | OPTIONAL
Backups deletion policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Deletion must propagate to derived data and files per rules.**
- **Legal hold must override deletion/TTL when enabled.**
- **Verification must be explicit (counts/checks).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Retention Classes`
2. `## TTLs`
3. `## Policy`
4. `## (Repeat per policy.)`
5. `## Deletion Request Types`
6. `## Deletion Workflow`
7. `## steps:`
8. `## Propagation`
9. `## Legal Hold`
10. `## Verification`

## 8. Cross-References

- **Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PRIV-09}}, {{xref:COMP-09}} | OPTIONAL**
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
