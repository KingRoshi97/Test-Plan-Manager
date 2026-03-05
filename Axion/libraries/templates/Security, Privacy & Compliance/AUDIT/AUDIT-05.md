# AUDIT-05 — Retention & Access Controls (who can view, how long)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-05                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring retention & access controls (who can view, how long)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Retention & Access Controls (who can view, how long) Document                         |

## 2. Purpose

Define the canonical retention policy and access controls for audit logs: how long logs are
retained per event category/class, who can view/export them, and how access is
approved/audited. This template must align with privacy retention rules and privileged access
policy.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- Privacy retention/deletion: {{xref:PRIV-05}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Retention classes list (short/standard/long)
Retention days per class (or UNKNOWN)
Access roles allowed (who can view)
Export rules (who can export, approvals)
Search/query access policy (who can search)
Redaction rules for audit viewing (PII masking)
Break-glass access rules (if needed)
Audit-of-audit requirements (log access to logs)
Telemetry requirements (access events, exports)

Optional Fields
Legal hold interaction rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Audit logs should be retained long enough for security investigations and compliance, but must
respect privacy constraints.
Viewing/export access must be least privilege and auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Retention Classes
classes: {{retention.classes}}
2. Retention Durations
short_days: {{retention.short_days}}
standard_days: {{retention.standard_days}}
long_days: {{retention.long_days}}
3. Access Roles
viewer_roles: {{access.viewer_roles}}
exporter_roles: {{access.exporter_roles}} | OPTIONAL
4. Export Rules
approval_required: {{export.approval_required}}
approval_rule: {{export.approval_rule}} | OPTIONAL
5. Query/Search Access
search_access_rule: {{search.access_rule}}
6. Redaction for Viewing
masking_rule: {{view.masking_rule}}
7. Break-Glass
supported: {{break.supported}}
rule: {{break.rule}} | OPTIONAL
8. Audit of Audit
log_access_events: {{audit_of_audit.log_access_events}}
event_types: {{audit_of_audit.event_types}} | OPTIONAL
9. Telemetry
audit_view_metric: {{telemetry.view_metric}}
audit_export_metric: {{telemetry.export_metric}} | OPTIONAL
10.References
Privileged access: {{xref:IAM-06}} | OPTIONAL
Privacy retention: {{xref:PRIV-05}} | OPTIONAL
Forensics workflow: {{xref:AUDIT-06}} | OPTIONAL
Cross-References
Upstream: {{xref:AUDIT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:AUDIT-06}}, {{xref:AUDIT-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define retention classes/days and viewer roles and masking rule.
intermediate: Required. Define export rules and audit-of-audit and telemetry metrics.
advanced: Required. Add legal hold interaction and strict approval workflows and break-glass
rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, approval rule, exporter roles, break rule,
event types, optional metrics, legal hold interaction, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If retention.classes is UNKNOWN → block Completeness Gate.
If retention.standard_days is UNKNOWN → block Completeness Gate.
If access.viewer_roles is UNKNOWN → block Completeness Gate.
If view.masking_rule is UNKNOWN → block Completeness Gate.
If telemetry.view_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.AUDIT
Pass conditions:
required_fields_present == true
retention_defined == true
access_controls_defined == true
masking_defined == true
audit_of_audit_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

AUDIT-06

AUDIT-06 — Investigation Workflow (queries, exports, chain-of-custody)
Header Block

## 5. Optional Fields

Legal hold interaction rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Audit logs should be retained long enough for security investigations and compliance, but must**
- **respect privacy constraints.**
- **Viewing/export access must be least privilege and auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Retention Classes`
2. `## Retention Durations`
3. `## Access Roles`
4. `## Export Rules`
5. `## Query/Search Access`
6. `## Redaction for Viewing`
7. `## Break-Glass`
8. `## Audit of Audit`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-06}}, {{xref:AUDIT-09}} | OPTIONAL**
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
