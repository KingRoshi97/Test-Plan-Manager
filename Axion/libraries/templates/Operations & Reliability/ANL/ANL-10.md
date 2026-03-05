# ANL-10 — Analytics Access Controls (who can query/export)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-10                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring analytics access controls (who can query/export)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Analytics Access Controls (who can query/export) Document                         |

## 2. Purpose

Define the canonical access control policy for analytics tools and data: who can query, who can
export, what approval is needed, how access is reviewed, and how sensitive fields are
protected. This template must align with privileged access policy and PII tiering.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Data sharing map (analytics vendors): {{xref:PRIV-06}} | OPTIONAL
- Vendor risk management: {{xref:COMP-03}} | OPTIONAL
- Analytics retention/deletion: {{xref:ANL-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Analytics systems in scope (tool_id list)
Access roles (viewer, analyst, admin)
Query access rules (least privilege)
Export access rules (approvals required?)
Sensitive field protection (masking/unmasking)
Audit logging requirements (who queried/exported)
Access review cadence (periodic review)
Vendor access constraints (third-party accounts)
Telemetry requirements (exports, unusual queries)
Incident rule (suspicious access → IRP)

Optional Fields
Break-glass access for investigations | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Exports of sensitive data should be rare, approved, and logged.
Access must be periodically reviewed and revoked when not needed.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Systems
tools: {{tools.list}}
2. Roles
roles: {{roles.list}}
3. Query Access
query_rule: {{access.query_rule}}
role_mapping: {{access.role_mapping}} | OPTIONAL
4. Export Access
export_rule: {{export.rule}}
approval_rule: {{export.approval_rule}} | OPTIONAL
5. Sensitive Fields
masking_rule: {{sensitive.masking_rule}}
unmask_rule: {{sensitive.unmask_rule}} | OPTIONAL
6. Audit
audit_required: {{audit.required}}
audit_events: {{audit.events}} | OPTIONAL
audit_ref: {{xref:AUDIT-01}} | OPTIONAL
7. Reviews
review_cadence: {{reviews.cadence}}
review_ref: {{xref:IAM-09}} | OPTIONAL
8. Vendor Constraints
vendor_rule: {{vendor.rule}}
account_management_rule: {{vendor.account_management_rule}} | OPTIONAL
9. Telemetry
export_count_metric: {{telemetry.export_count_metric}}
unusual_query_metric: {{telemetry.unusual_query_metric}} | OPTIONAL
10.Incident Handling
incident_rule: {{incident.rule}}
irp_ref: {{xref:IRP-02}} | OPTIONAL
Cross-References
Upstream: {{xref:IAM-06}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:COMP-10}}, {{xref:AUDIT-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define tools, roles, query/export rules, and masking rule.
intermediate: Required. Define audit events, reviews cadence, and telemetry.
advanced: Required. Add break-glass and strict vendor account governance and incident
triggers.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, role mapping, approval rule, unmask
rule, audit events, review ref, vendor account mgmt, optional metrics, break-glass,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If tools.list is UNKNOWN → block Completeness Gate.
If roles.list is UNKNOWN → block Completeness Gate.
If access.query_rule is UNKNOWN → block Completeness Gate.
If export.rule is UNKNOWN → block Completeness Gate.
If telemetry.export_count_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ANL
Pass conditions:
required_fields_present == true
tools_and_roles_defined == true
query_and_export_defined == true
audit_and_reviews_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Logging & Tracing Standards (LTS)

LTS-01

LTS-01 — Logging Standard (levels, structure, fields)
Header Block

## 5. Optional Fields

Break-glass access for investigations | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Exports of sensitive data should be rare, approved, and logged.**
- **Access must be periodically reviewed and revoked when not needed.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Systems`
2. `## Roles`
3. `## Query Access`
4. `## Export Access`
5. `## Sensitive Fields`
6. `## Audit`
7. `## Reviews`
8. `## Vendor Constraints`
9. `## Telemetry`
10. `## Incident Handling`

## 8. Cross-References

- **Upstream: {{xref:IAM-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-10}}, {{xref:AUDIT-09}} | OPTIONAL**
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
