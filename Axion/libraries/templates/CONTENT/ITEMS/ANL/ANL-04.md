# ANL-04 — Identity/Attribution Model (anon/user/tenant)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-04                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring identity/attribution model (anon/user/tenant)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Identity/Attribution Model (anon/user/tenant) Document                         |

## 2. Purpose

Define the canonical identity and attribution model used for analytics: anonymous identifiers,
logged-in user identifiers, tenant/org attribution, sessionization, and identity merge rules. This
model must align with privacy minimization and consent and must not expose raw user
identifiers.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Session management policy: {{xref:IAM-03}} | OPTIONAL
- Consent model: {{xref:PRIV-04}} | OPTIONAL
- Pseudonymization rules: {{xref:PRIV-08}} | OPTIONAL
- Event taxonomy: {{xref:ANL-02}} | OPTIONAL
- Schema spec: {{xref:ANL-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Identifier types (anon_id, user_id_hash, device_id?)
Generation rules (when created)
Storage rules (client storage limits)
Session model (session_id, timeout)
User login attribution rule (anon→user merge)
Tenant attribution rule (tenant_id field)
Cross-device attribution rule (if any)
PII minimization rule (no raw identifiers)
Deletion/retention interaction (PRIV-05)
Telemetry requirements (merge success, id missing)

Optional Fields
GDPR/consent interaction notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Do not send raw user IDs in analytics; use hashed/pseudonymized identifiers.
Merge rules must be deterministic and documented (avoid double-counting).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Identifier Types
types: {{ids.types}}
2. Generation
anon_id_generation_rule: {{gen.anon_rule}}
user_id_hash_rule: {{gen.user_hash_rule}} | OPTIONAL
3. Storage
client_storage_rule: {{store.client_rule}}
ttl_rule: {{store.ttl_rule}} | OPTIONAL
4. Sessions
session_id_rule: {{session.id_rule}}
session_timeout_minutes: {{session.timeout_minutes}}
5. Login Attribution
merge_rule: {{merge.rule}}
merge_window_rule: {{merge.window_rule}} | OPTIONAL
6. Tenant Attribution
tenant_field: {{tenant.field}}
tenant_rule: {{tenant.rule}} | OPTIONAL
7. Cross-Device
supported: {{xdev.supported}}
rule: {{xdev.rule}} | OPTIONAL
8. Privacy / Retention
minimization_rule: {{privacy.minimization_rule}}
retention_ref: {{xref:PRIV-05}} | OPTIONAL
9. Telemetry
id_missing_metric: {{telemetry.id_missing_metric}}
merge_success_metric: {{telemetry.merge_success_metric}} | OPTIONAL
10.References
Consent model: {{xref:PRIV-04}} | OPTIONAL
Pseudonymization: {{xref:PRIV-08}} | OPTIONAL
Session policy: {{xref:IAM-03}} | OPTIONAL
Cross-References
Upstream: {{xref:IAM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:ANL-05}}, {{xref:ANL-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define identifier types, session timeout, and merge rule.
intermediate: Required. Define storage rules, tenant attribution, and telemetry.
advanced: Required. Add cross-device support and consent/GDPR notes and strict retention
linkage.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, user hash rule, ttl/merge window rules,
tenant rule, xdev rules, optional metrics, consent notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If ids.types is UNKNOWN → block Completeness Gate.
If session.timeout_minutes is UNKNOWN → block Completeness Gate.
If merge.rule is UNKNOWN → block Completeness Gate.
If privacy.minimization_rule is UNKNOWN → block Completeness Gate.
If telemetry.id_missing_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ANL
Pass conditions:
required_fields_present == true
ids_and_sessions_defined == true
merge_and_tenant_defined == true
privacy_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ANL-05

ANL-05 — Consent & Opt-Out Enforcement (ties to PRIV-04)
Header Block

## 5. Optional Fields

GDPR/consent interaction notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not send raw user IDs in analytics; use hashed/pseudonymized identifiers.
- **Merge rules must be deterministic and documented (avoid double-counting).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Identifier Types`
2. `## Generation`
3. `## Storage`
4. `## Sessions`
5. `## Login Attribution`
6. `## Tenant Attribution`
7. `## Cross-Device`
8. `## Privacy / Retention`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:IAM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-05}}, {{xref:ANL-10}} | OPTIONAL**
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
