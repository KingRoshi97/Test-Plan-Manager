# COMP-03 — Vendor Risk Management (third-party reviews, DPAs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-03                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring vendor risk management (third-party reviews, dpas)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Vendor Risk Management (third-party reviews, DPAs) Document                         |

## 2. Purpose

Define the canonical vendor risk management process: how third parties are assessed,
approved, monitored, and re-reviewed, including security questionnaires, DPAs, and evidence
storage. This template must align with integration inventory and data sharing map.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Integration inventory: {{xref:IXS-01}} | OPTIONAL
- Data sharing map: {{xref:PRIV-06}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- Integration security baseline: {{xref:IXS-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Vendor tiering model (... | spec         | Yes             |
| Vendors in scope (prov... | spec         | Yes             |
| DPA requirement rule (... | spec         | Yes             |
| Approval roles (securi... | spec         | Yes             |
| Re-review cadence (ann... | spec         | Yes             |
| Incident notification ... | spec         | Yes             |
| Evidence storage location | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Continuous monitoring approach | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
High-risk vendors must have stricter review and DPAs where required.
Vendor approvals must be recorded and auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Tiering Model
tiers: {{tiers.model}}
tiering_rule: {{tiers.rule}} | OPTIONAL
2. Vendors In Scope
vendors: {{vendors.list}}
3. Review Requirements
required_artifacts: {{review.artifacts}}
minimum_controls: {{review.minimum_controls}} | OPTIONAL
4. DPAs
dpa_required_rule: {{dpa.required_rule}}
dpa_storage_location: {{dpa.storage_location}} | OPTIONAL
5. Approvals
approver_roles: {{approve.roles}}
approval_workflow: {{approve.workflow}} | OPTIONAL
6. Re-Review
cadence: {{recheck.cadence}}
overdue_rule: {{recheck.overdue_rule}} | OPTIONAL
7. Incident Notifications
vendor_notify_rule: {{incident.vendor_notify_rule}}
contact_method: {{incident.contact_method}} | OPTIONAL
8. Evidence Storage
evidence_location: {{evidence.location}}
9. Telemetry
vendors_reviewed_metric: {{telemetry.reviewed_metric}}
vendors_overdue_metric: {{telemetry.overdue_metric}} | OPTIONAL
10.References
Integration inventory: {{xref:IXS-01}} | OPTIONAL
Data sharing map: {{xref:PRIV-06}} | OPTIONAL
Security baseline: {{xref:IXS-08}} | OPTIONAL
Cross-References
Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-05}}, {{xref:COMP-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define tiering and vendor list and evidence location.

intermediate: Required. Define review artifacts, DPA rule, approvals, cadence.
advanced: Required. Add continuous monitoring and strict overdue enforcement and incident
notification detail.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, tiering rule, minimum controls, dpa
storage, approval workflow, overdue rule, contact method, optional metrics, continuous
monitoring, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If tiers.model is UNKNOWN → block Completeness Gate.
If vendors.list is UNKNOWN → block Completeness Gate.
If dpa.required_rule is UNKNOWN → block Completeness Gate.
If evidence.location is UNKNOWN → block Completeness Gate.
If telemetry.reviewed_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
tiering_and_vendor_list_defined == true
review_and_approval_defined == true
evidence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-04

COMP-04 — Policy & Training Requirements (who must do what)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **High-risk vendors must have stricter review and DPAs where required.**
- **Vendor approvals must be recorded and auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Tiering Model`
2. `## Vendors In Scope`
3. `## Review Requirements`
4. `## DPAs`
5. `## Approvals`
6. `## Re-Review`
7. `## Incident Notifications`
8. `## Evidence Storage`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-05}}, {{xref:COMP-09}} | OPTIONAL**
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
