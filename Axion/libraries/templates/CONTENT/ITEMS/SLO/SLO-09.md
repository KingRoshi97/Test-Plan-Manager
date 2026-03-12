# SLO-09 — Exceptions & Adjustments (temporary changes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-09                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring exceptions & adjustments (temporary changes)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Exceptions & Adjustments (temporary changes) Document                         |

## 2. Purpose

Define the canonical process for temporary SLO exceptions and adjustments: when an SLO
target/window can be temporarily changed, how it is approved, how it expires, and how it is
documented/audited. This template prevents “silent” reliability downgrades.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Error budget policy: {{xref:SLO-04}} | OPTIONAL
- Exception management: {{xref:COMP-08}} | OPTIONAL
- Change calendar/freeze rules: {{xref:REL-09}} | OPTIONAL
- SLO review process: {{xref:SLO-08}} | OPTIONAL
- Privileged change audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Allowed exception type... | spec         | Yes             |
| Request fields (why, d... | spec         | Yes             |
| Approver roles (servic... | spec         | Yes             |
| Max duration rule         | spec         | Yes             |
| Expiry/renewal rule       | spec         | Yes             |
| Communication rule (wh... | spec         | Yes             |
| Audit logging rule (re... | spec         | Yes             |
| Reversion rule (auto r... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Emergency exception rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
No exceptions without expiry and compensating controls/actions.
Temporary changes must be reversible and documented.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Exception Types
types: {{types.list}}
2. Request
required_fields: {{request.fields}}
3. Approvals
approver_roles: {{approve.roles}}
workflow_ref: {{xref:COMP-08}} | OPTIONAL
4. Duration
max_days: {{duration.max_days}}
renewal_rule: {{duration.renewal_rule}} | OPTIONAL
5. Communications
notify_rule: {{comms.notify_rule}}
6. Audit
audit_required: {{audit.required}}
audit_ref: {{xref:AUDIT-07}} | OPTIONAL
7. Reversion
revert_rule: {{revert.rule}}
8. Telemetry
active_exceptions_metric: {{telemetry.active_metric}}
overdue_exceptions_metric: {{telemetry.overdue_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:SLO-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SLO-10}}, {{xref:REL-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define types, required fields, max days, revert rule.
intermediate: Required. Define approvals, comms, audit rule, telemetry.
advanced: Required. Add emergency rules and stricter renewal/rollback governance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, workflow ref, renewal rule, audit ref,
optional metric, emergency rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If types.list is UNKNOWN → block Completeness Gate.

If request.fields is UNKNOWN → block Completeness Gate.
If duration.max_days is UNKNOWN → block Completeness Gate.
If revert.rule is UNKNOWN → block Completeness Gate.
If telemetry.active_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
exception_process_defined == true
expiry_and_reversion_defined == true
audit_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-10

SLO-10 — Reporting (dashboards, exec summaries)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **No exceptions without expiry and compensating controls/actions.**
- **Temporary changes must be reversible and documented.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Exception Types`
2. `## Request`
3. `## Approvals`
4. `## Duration`
5. `## Communications`
6. `## Audit`
7. `## Reversion`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:SLO-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SLO-10}}, {{xref:REL-09}} | OPTIONAL**
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
