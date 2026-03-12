# PRIV-10 — Privacy Metrics & Audits (coverage, violations)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-10                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring privacy metrics & audits (coverage, violations)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Privacy Metrics & Audits (coverage, violations) Document                         |

## 2. Purpose

Define the canonical privacy metrics and audit program: coverage metrics for inventories and
consent, violation monitoring, deletion/retention audits, and periodic review cadence. This
template must align with audit anomaly detection and compliance reporting.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Minimization rules: {{xref:PRIV-03}} | OPTIONAL
- Retention/deletion policy: {{xref:PRIV-05}} | OPTIONAL
- Compliance reporting: {{xref:COMP-10}} | OPTIONAL
- Audit anomaly detection: {{xref:AUDIT-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Violation metrics list... | spec         | Yes             |
| Deletion/retention aud... | spec         | Yes             |
| Audit cadence (monthly... | spec         | Yes             |
| Owners (who reviews)      | spec         | Yes             |
| Evidence artifacts pro... | spec         | Yes             |
| Escalation rules (viol... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

External audit support | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Audits must be repeatable and produce evidence artifacts.
Violations must have escalation paths tied to PRIV-09/SEC-05.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Core Metrics
metrics: {{metrics.core}}
2. Violation Metrics
violations: {{metrics.violations}}
3. Audit Checks
checks: {{audit.checks}}
4. Cadence & Ownership
cadence: {{cadence.value}}
owners: {{owners.list}}
5. Evidence
artifacts: {{evidence.artifacts}}
storage_location: {{evidence.storage_location}} | OPTIONAL
6. Escalation
escalation_rule: {{escalate.rule}}
incident_ref: {{xref:PRIV-09}} | OPTIONAL
7. Telemetry
published_metric: {{telemetry.published_metric}}
8. References
Retention policy: {{xref:PRIV-05}} | OPTIONAL
Incident handling: {{xref:PRIV-09}} | OPTIONAL
Compliance reporting: {{xref:COMP-10}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-09}}, {{xref:SEC-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define metrics list, cadence, and escalation rule.
intermediate: Required. Define audit checks and evidence artifacts and ownership.
advanced: Required. Add external audit support and stricter publication/reporting pipelines.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, evidence storage, incident ref, external
audit, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

If metrics.core is UNKNOWN → block Completeness Gate.
If audit.checks is UNKNOWN → block Completeness Gate.
If cadence.value is UNKNOWN → block Completeness Gate.
If owners.list is UNKNOWN → block Completeness Gate.
If telemetry.published_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PRIV
Pass conditions:
required_fields_present == true
metrics_defined == true
audit_checks_defined == true
cadence_and_owners_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Audit Logging & Forensics (AUDIT)

AUDIT-01

AUDIT-01 — Audit Event Catalog (by event_type)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Audits must be repeatable and produce evidence artifacts.**
- **Violations must have escalation paths tied to PRIV-09/SEC-05.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Core Metrics`
2. `## Violation Metrics`
3. `## Audit Checks`
4. `## Cadence & Ownership`
5. `## Evidence`
6. `## Escalation`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-09}}, {{xref:SEC-06}} | OPTIONAL**
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
