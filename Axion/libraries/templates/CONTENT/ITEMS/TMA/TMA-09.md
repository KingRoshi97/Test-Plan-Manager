# TMA-09 — Security Validation (tests, drills, red team-lite)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-09                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security validation (tests, drills, red team-lite)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Validation (tests, drills, red team-lite) Document                         |

## 2. Purpose

Define the validation program that proves threats/risks are mitigated: security tests mapped to
risks, tabletop drills, red-team-lite exercises, and closure evidence. This template connects the
threat model to the security testing plan and incident response preparedness.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security testing plan: {{xref:SEC-09}} | OPTIONAL
- Risk register: {{xref:TMA-04}} | OPTIONAL
- Incident response: {{xref:SEC-05}} | OPTIONAL
- Security runbooks: {{xref:SEC-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Validation activities ... | spec         | Yes             |
| Risk coverage mapping ... | spec         | Yes             |
| Tabletop drill cadence    | spec         | Yes             |
| Red team-lite cadence ... | spec         | Yes             |
| Drill scope selection ... | spec         | Yes             |
| Success criteria (pass... | spec         | Yes             |
| Evidence artifacts pro... | spec         | Yes             |
| Remediation workflow f... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

External pen test integration | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Every high-risk item should have a validation activity mapped to it.
Validations must produce evidence artifacts.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Activities
activities: {{acts.list}}
2. Risk Coverage
mapping_rule: {{coverage.mapping_rule}}
coverage_target: {{coverage.target}} | OPTIONAL
3. Tabletop Drills
cadence: {{tabletop.cadence}}
scope_rule: {{tabletop.scope_rule}} | OPTIONAL
4. Red Team-lite
cadence: {{redteam.cadence}}
scope_rule: {{redteam.scope_rule}} | OPTIONAL
5. Success Criteria
criteria: {{success.criteria}}
6. Evidence
artifacts: {{evidence.artifacts}}
storage_location: {{evidence.storage_location}} | OPTIONAL
7. Remediation
on_fail_steps: {{remed.on_fail_steps}}
tracking_rule: {{remed.tracking_rule}} | OPTIONAL
8. Telemetry
validation_coverage_metric: {{telemetry.coverage_metric}}
validation_fail_metric: {{telemetry.fail_metric}} | OPTIONAL
9. References
Risk register: {{xref:TMA-04}} | OPTIONAL
Security testing: {{xref:SEC-09}} | OPTIONAL
Incident response: {{xref:SEC-05}} | OPTIONAL
Runbooks: {{xref:SEC-10}} | OPTIONAL
Cross-References
Upstream: {{xref:TMA-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:TMA-10}}, {{xref:SEC-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define tabletop cadence, success criteria, and evidence artifacts.
intermediate: Required. Define mapping to risk ids and remediation workflow and telemetry.

advanced: Required. Add red team scope rigor and external pen test integration and coverage
targets.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, coverage target, scope rules, storage
location, tracking rule, optional metrics, external pen test, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If acts.list is UNKNOWN → block Completeness Gate.
If tabletop.cadence is UNKNOWN → block Completeness Gate.
If success.criteria is UNKNOWN → block Completeness Gate.
If evidence.artifacts is UNKNOWN → block Completeness Gate.
If telemetry.coverage_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.TMA
Pass conditions:
required_fields_present == true
activities_defined == true
risk_coverage_defined == true
evidence_defined == true
remediation_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

TMA-10

TMA-10 — TMA Runbooks (triage, containment actions)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every high-risk item should have a validation activity mapped to it.**
- **Validations must produce evidence artifacts.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Activities`
2. `## Risk Coverage`
3. `## Tabletop Drills`
4. `## Red Team-lite`
5. `## Success Criteria`
6. `## Evidence`
7. `## Remediation`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:TMA-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:TMA-10}}, {{xref:SEC-06}} | OPTIONAL**
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
