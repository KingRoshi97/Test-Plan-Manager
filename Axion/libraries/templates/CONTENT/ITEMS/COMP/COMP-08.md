# COMP-08 — Exception Management (waivers, expiries, reviews)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-08                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring exception management (waivers, expiries, reviews)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Exception Management (waivers, expiries, reviews) Document                         |

## 2. Purpose

Define the canonical process for compliance exceptions/waivers: request, approval, expiry,
review, and audit logging. This template coordinates with security exceptions but covers
compliance control deviations broadly.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security exceptions process: {{xref:SEC-08}} | OPTIONAL
- Control matrix: {{xref:COMP-02}} | OPTIONAL
- Privileged audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Exception request sche... | spec         | Yes             |
| Approval roles (compli... | spec         | Yes             |
| Expiry requirement (ma... | spec         | Yes             |
| Compensating controls ... | spec         | Yes             |
| Evidence requirement (... | spec         | Yes             |
| Review cadence (re-app... | spec         | Yes             |
| Revocation process        | spec         | Yes             |
| Tracking system/location  | spec         | Yes             |
| Audit logging requirem... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Emergency waivers process | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
No waivers without expiry and documented risk.
Approvals and evidence must be recorded and auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Request Schema
fields_required: {{schema.fields_required}}
2. Approvals
approver_roles: {{approve.roles}}
workflow: {{approve.workflow}} | OPTIONAL
3. Expiry
max_duration_days: {{expiry.max_duration_days}}
renewal_policy: {{expiry.renewal_policy}} | OPTIONAL
4. Compensating Controls
required: {{comp.required}}
documentation_rule: {{comp.doc_rule}} | OPTIONAL
5. Evidence
evidence_fields: {{evidence.fields}}
6. Reviews
review_cadence: {{review.cadence}}
overdue_rule: {{review.overdue_rule}} | OPTIONAL
7. Revocation
revoke_process: {{revoke.process}}
8. Tracking
system: {{track.system}}
storage_location: {{track.storage_location}} | OPTIONAL
9. Audit
audit_required: {{audit.required}}
audit_events: {{audit.events}} | OPTIONAL
10.Telemetry
active_exceptions_metric: {{telemetry.active_metric}}
overdue_exceptions_metric: {{telemetry.overdue_metric}} | OPTIONAL
11.References
Security exceptions: {{xref:SEC-08}} | OPTIONAL
Control matrix: {{xref:COMP-02}} | OPTIONAL
Cross-References
Upstream: {{xref:COMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define schema fields, approvers, max duration, revoke process.
intermediate: Required. Define evidence fields, reviews, audit, telemetry.
advanced: Required. Add emergency process and strict overdue enforcement and cross-links to
controls.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, workflow, renewal policy, doc rule,
overdue rule, storage location, audit events, optional metrics, emergency process,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If schema.fields_required is UNKNOWN → block Completeness Gate.
If approve.roles is UNKNOWN → block Completeness Gate.
If expiry.max_duration_days is UNKNOWN → block Completeness Gate.
If revoke.process is UNKNOWN → block Completeness Gate.
If telemetry.active_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
approvals_and_expiry_defined == true
evidence_and_reviews_defined == true
audit_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-09

COMP-09 — Evidence Collection Plan (artifacts, cadence, storage)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **No waivers without expiry and documented risk.**
- **Approvals and evidence must be recorded and auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Request Schema`
2. `## Approvals`
3. `## Expiry`
4. `## Compensating Controls`
5. `## Evidence`
6. `## Reviews`
7. `## Revocation`
8. `## Tracking`
9. `## Audit`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:COMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define schema fields, approvers, max duration, revoke process.**
- **intermediate: Required. Define evidence fields, reviews, audit, telemetry.**
- **advanced: Required. Add emergency process and strict overdue enforcement and cross-links to**
- controls.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, workflow, renewal policy, doc rule,**
- overdue rule, storage location, audit events, optional metrics, emergency process,
- open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If schema.fields_required is UNKNOWN → block

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
