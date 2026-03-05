# AUDIT-08 — Redaction & PII Handling (safe storage of audit data)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-08                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring redaction & pii handling (safe storage of audit data)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Redaction & PII Handling (safe storage of audit data) Document                         |

## 2. Purpose

Define the canonical redaction and PII handling rules specific to audit data: what can be stored,
what must be hashed/masked, how access is controlled, and how audit exports are scrubbed.
This template must align with PII tiering and global logging redaction rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Secrets/log redaction: {{xref:SKM-09}} | OPTIONAL
- Logging policy: {{xref:CER-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| PII handling rule (wha... | spec         | Yes             |
| Hashing rules (which i... | spec         | Yes             |
| Masking rules for view... | spec         | Yes             |
| Field allowlist/denyli... | spec         | Yes             |
| Export redaction rules    | spec         | Yes             |
| Access control rules (... | spec         | Yes             |
| Retention interaction ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Tier-specific handling overrides | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Default to hashing identifiers; avoid raw PII in audit logs unless strictly required.
Exports must apply redaction by default.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Allowed PII
allowed_rule: {{pii.allowed_rule}}
allowed_fields: {{pii.allowed_fields}} | OPTIONAL
2. Hashing
hash_fields: {{hash.fields}}
hash_method_rule: {{hash.method_rule}} | OPTIONAL
3. Masking (Viewing)
masking_rule: {{mask.rule}}
unmask_access_rule: {{mask.unmask_access_rule}} | OPTIONAL
4. Allowlist / Denylist
allowlist: {{fields.allowlist}}
denylist: {{fields.denylist}}
5. Export Redaction
export_rule: {{export.rule}}
default_export_masked: {{export.default_masked}} | OPTIONAL
6. Retention Interaction
retention_rule: {{retention.rule}}
7. Telemetry
redaction_applied_metric: {{telemetry.redaction_applied_metric}}
audit_pii_violation_metric: {{telemetry.pii_violation_metric}} | OPTIONAL
8. References
PII classification: {{xref:PRIV-02}} | OPTIONAL
Audit access controls: {{xref:AUDIT-05}} | OPTIONAL
Forensics workflow: {{xref:AUDIT-06}} | OPTIONAL
Cross-References
Upstream: {{xref:AUDIT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:AUDIT-05}}, {{xref:AUDIT-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define denylist, hashing fields, and export rule.
intermediate: Required. Define masking/unmask access rules and telemetry.
advanced: Required. Add tier overrides and stricter retention interaction rationale.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, allowed fields, hash method, unmask

access, default masked, tier overrides, optional metric, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If fields.denylist is UNKNOWN → block Completeness Gate.
If hash.fields is UNKNOWN → block Completeness Gate.
If export.rule is UNKNOWN → block Completeness Gate.
If retention.rule is UNKNOWN → block Completeness Gate.
If telemetry.redaction_applied_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.AUDIT
Pass conditions:
required_fields_present == true
hashing_and_denylist_defined == true
export_redaction_defined == true
retention_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

AUDIT-09

AUDIT-09 — Alerts & Anomaly Detection (suspicious patterns)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Default to hashing identifiers; avoid raw PII in audit logs unless strictly required.**
- **Exports must apply redaction by default.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Allowed PII`
2. `## Hashing`
3. `## Masking (Viewing)`
4. `## Allowlist / Denylist`
5. `## Export Redaction`
6. `## Retention Interaction`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-05}}, {{xref:AUDIT-09}} | OPTIONAL**
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
