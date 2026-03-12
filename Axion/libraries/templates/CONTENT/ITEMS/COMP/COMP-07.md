# COMP-07 — Risk Assessments (periodic, triggers, owners)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-07                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring risk assessments (periodic, triggers, owners)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Risk Assessments (periodic, triggers, owners) Document                         |

## 2. Purpose

Define the canonical risk assessment process: how risks are identified, assessed, tracked,
reviewed, and re-assessed—covering security/privacy/compliance risks and vendor risks. This
template must align with threat risk register and exception management.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- Threat risk register: {{xref:TMA-04}} | OPTIONAL
- Security baseline controls: {{xref:SEC-03}} | OPTIONAL
- Exception management: {{xref:COMP-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Risk categories list (... | spec         | Yes             |
| Assessment cadence (qu... | spec         | Yes             |
| Trigger events (new ve... | spec         | Yes             |
| Assessment workflow steps | spec         | Yes             |
| Rating model (likeliho... | spec         | Yes             |
| Ownership roles (who a... | spec         | Yes             |
| Documentation/evidence... | spec         | Yes             |
| Escalation rules (high... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Tooling/location for risk register | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Assessments must be recorded and reviewable; not informal.
High risks must have action plans or acceptance records.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Categories
categories: {{risk.categories}}
2. Cadence
cadence: {{cadence.value}}
trigger_events: {{cadence.triggers}}
3. Workflow
steps:
{{workflow.steps[0]}}
{{workflow.steps[1]}}
{{workflow.steps[2]}} | OPTIONAL
4. Rating Model
model: {{rating.model}}
definitions: {{rating.definitions}} | OPTIONAL
5. Ownership
assessor_roles: {{owners.assessor_roles}}
approver_roles: {{owners.approver_roles}} | OPTIONAL
6. Evidence
required_artifacts: {{evidence.artifacts}}
storage_location: {{evidence.storage_location}} | OPTIONAL
7. Escalation
high_risk_rule: {{esc.high_risk_rule}}
acceptance_ref: {{xref:COMP-08}} | OPTIONAL
8. Telemetry
assessments_completed_metric: {{telemetry.completed_metric}}
assessments_overdue_metric: {{telemetry.overdue_metric}} | OPTIONAL
9. References
Risk register: {{xref:TMA-04}} | OPTIONAL
Vendor risk: {{xref:COMP-03}} | OPTIONAL
Exceptions: {{xref:COMP-08}} | OPTIONAL
Cross-References
Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-10}}, {{xref:COMP-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define categories, cadence, workflow steps, and high-risk rule.

intermediate: Required. Define ownership and evidence artifacts and telemetry.
advanced: Required. Add tooling/location details and stricter triggers and acceptance linkage.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, approver roles, storage
location, overdue metric, tooling/location, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If risk.categories is UNKNOWN → block Completeness Gate.
If cadence.value is UNKNOWN → block Completeness Gate.
If workflow.steps[0] is UNKNOWN → block Completeness Gate.
If esc.high_risk_rule is UNKNOWN → block Completeness Gate.
If telemetry.completed_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
cadence_and_triggers_defined == true
workflow_and_rating_defined == true
ownership_and_evidence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-08

COMP-08 — Exception Management (waivers, expiries, reviews)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Assessments must be recorded and reviewable; not informal.**
- **High risks must have action plans or acceptance records.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Categories`
2. `## Cadence`
3. `## Workflow`
4. `## steps:`
5. `## Rating Model`
6. `## Ownership`
7. `## Evidence`
8. `## Escalation`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-10}}, {{xref:COMP-09}} | OPTIONAL**
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
