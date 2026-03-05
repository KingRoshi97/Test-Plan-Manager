# COMP-10 — Compliance Reporting & Audits (internal/external audits)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-10                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring compliance reporting & audits (internal/external audits)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Compliance Reporting & Audits (internal/external audits) Document                         |

## 2. Purpose

Define the canonical compliance reporting and audit execution process: internal audit cadence,
external audit readiness, what reports are produced, and how evidence is packaged and
delivered. This template must align with evidence collection plans and investigation workflows.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Control matrix: {{xref:COMP-02}} | OPTIONAL
- Evidence collection plan: {{xref:COMP-09}} | OPTIONAL
- Privacy metrics/audits: {{xref:PRIV-10}} | OPTIONAL
- Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Cadence (quarterly/ann... | spec         | Yes             |
| Owners (who prepares)     | spec         | Yes             |
| Evidence packaging pro... | spec         | Yes             |
| Audit request intake w... | spec         | Yes             |
| Scope confirmation pro... | spec         | Yes             |
| Findings tracking proc... | spec         | Yes             |
| Communication rules (w... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Auditor access rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Reports must be based on evidence artifacts, not statements.
Findings must be tracked to closure with owners and due dates.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Reporting Types
types: {{report.types}}
2. Cadence & Owners
cadence: {{cadence.value}}
owners: {{owners.list}}
3. Evidence Packaging
process: {{evidence.process}}
packaging_location: {{evidence.location}} | OPTIONAL
4. Audit Intake
intake_steps: {{audit.intake_steps}}
scope_confirm_rule: {{audit.scope_confirm_rule}} | OPTIONAL
5. Findings
tracking_system: {{findings.system}}
workflow: {{findings.workflow}}
closure_rule: {{findings.closure_rule}} | OPTIONAL
6. Communications
recipients: {{comms.recipients}}
confidentiality_rule: {{comms.confidentiality_rule}} | OPTIONAL
7. Telemetry
audits_completed_metric: {{telemetry.completed_metric}}
findings_closed_metric: {{telemetry.closed_metric}} | OPTIONAL
8. References
Control matrix: {{xref:COMP-02}} | OPTIONAL
Evidence plan: {{xref:COMP-09}} | OPTIONAL
Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
Cross-References
Upstream: {{xref:COMP-09}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SEC-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define report types, cadence, and findings tracking system.
intermediate: Required. Define evidence packaging and intake workflow and telemetry.
advanced: Required. Add auditor access rules and strict confidentiality and scope confirmation
rigor.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, packaging location, scope confirm rule,
closure rule, confidentiality rule, auditor access, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If report.types is UNKNOWN → block Completeness Gate.
If cadence.value is UNKNOWN → block Completeness Gate.
If findings.system is UNKNOWN → block Completeness Gate.
If telemetry.completed_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
reporting_and_cadence_defined == true
evidence_packaging_defined == true
findings_tracking_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Reports must be based on evidence artifacts, not statements.**
- **Findings must be tracked to closure with owners and due dates.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Reporting Types`
2. `## Cadence & Owners`
3. `## Evidence Packaging`
4. `## Audit Intake`
5. `## Findings`
6. `## Communications`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:COMP-09}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-06}} | OPTIONAL**
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
