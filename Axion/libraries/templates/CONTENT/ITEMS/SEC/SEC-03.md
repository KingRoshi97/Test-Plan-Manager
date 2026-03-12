# SEC-03 — Security Requirements (baseline controls checklist)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-03                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security requirements (baseline controls checklist)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Requirements (baseline controls checklist) Document                         |

## 2. Purpose

Define the baseline security requirements for the product as a checklist of enforceable controls
(what must be true). This document is the “security bar” used by reviews and gates and must
align with system trust boundaries, AuthN/AuthZ model, and audit requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security overview: {{xref:SEC-01}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Role/permission model: {{xref:IAM-01}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Control registry (cont... | spec         | Yes             |
| Minimum required contr... | spec         | Yes             |
| Evidence requirement p... | spec         | Yes             |
| Owner per control (tea... | spec         | Yes             |
| Severity/priority per ... | spec         | Yes             |
| Verification method pe... | spec         | Yes             |
| Exception policy refer... | spec         | Yes             |

## 5. Optional Fields

Per-surface control deltas (web/mobile/api) | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Controls must be testable or have explicit evidence requirements.
Do not list vague controls (“be secure”); every control must be enforceable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Control Categories
categories: {{controls.categories}}
2. Control Registry (repeat per control_id)
Control
control_id: {{controls.items[0].control_id}}
category: {{controls.items[0].category}}
title: {{controls.items[0].title}}
requirement: {{controls.items[0].requirement}}
severity: {{controls.items[0].severity}} (high/med/low/UNKNOWN)
owner: {{controls.items[0].owner}}
evidence: {{controls.items[0].evidence}}
verification_method: {{controls.items[0].verification_method}}
(test/check/manual/UNKNOWN)
refs: {{controls.items[0].refs}} | OPTIONAL
notes: {{controls.items[0].notes}} | OPTIONAL
(Repeat per control.)
3. Evidence Summary
minimum_evidence_artifacts: {{evidence.minimum_artifacts}} | OPTIONAL
storage_location: {{evidence.storage_location}} | OPTIONAL
4. Exceptions
exceptions_ref: {{xref:SEC-08}} | OPTIONAL
exceptions_rules: {{exceptions.rules}} | OPTIONAL
5. References
Security architecture: {{xref:SEC-02}} | OPTIONAL
Secure SDLC: {{xref:SEC-07}} | OPTIONAL
Audit logging: {{xref:AUDIT-03}} | OPTIONAL
Cross-References
Upstream: {{xref:SEC-01}}, {{xref:SEC-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SEC-07}}, {{xref:COMP-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define categories and at least a starter control registry with UNKNOWN
where needed.

intermediate: Required. Add evidence + verification method per control.
advanced: Required. Add severity, ownership, and explicit references/evidence artifacts per
control.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, refs/notes, evidence summary fields,
exceptions rules, per-surface deltas, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If controls.categories is UNKNOWN → block Completeness Gate.
If controls.items[].control_id is UNKNOWN → block Completeness Gate.
If controls.items[].requirement is UNKNOWN → block Completeness Gate.
If controls.items[].owner is UNKNOWN → block Completeness Gate.
If controls.items[].verification_method is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SEC
Pass conditions:
required_fields_present == true
control_registry_defined == true
each_control_has_evidence_and_verification == true
placeholder_resolution == true
no_unapproved_unknowns == true

SEC-04

SEC-04 — Vulnerability Management (patching, scans, SLAs)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Controls must be testable or have explicit evidence requirements.**
- Do not list vague controls (“be secure”); every control must be enforceable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Control Categories`
2. `## Control Registry (repeat per control_id)`
3. `## Control`
4. `## (test/check/manual/UNKNOWN)`
5. `## (Repeat per control.)`
6. `## Evidence Summary`
7. `## Exceptions`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:SEC-01}}, {{xref:SEC-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-07}}, {{xref:COMP-02}} | OPTIONAL**
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
