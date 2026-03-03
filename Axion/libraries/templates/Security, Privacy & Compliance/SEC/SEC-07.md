# SEC-07 — Application Security Controls

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-07                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring application security cont |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Application Security Controls             |

## 2. Purpose

Define the Secure SDLC policy for the product: required gates at each development stage (design review, code review, static analysis, dependency scan, pen test), pass criteria, and exception handling. This template must be consistent with security requirements and vulnerability management expectations.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Security requirements baseline: `{{xref:SEC-03}}` | OPTIONAL
- Vulnerability management: `{{xref:SEC-04}}` | OPTIONAL
- Control matrix: `{{xref:COMP-02}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| SDLC stages list (design, build, test, release, post-release) | spec | No |
| Gate per stage (gate_id, criteria) | spec | No |
| Code review policy (required, reviewer count, scope) | spec | No |
| Static analysis (SAST) requirements (tool, severity block threshold) | spec | No |
| Dependency scanning (SCA) requirements | spec | No |
| Pre-release checklist (what must be true before release) | spec | No |
| Exception/bypass policy (SEC-08) | spec | Yes |
| Evidence artifacts per gate | spec | No |
| Telemetry requirements (pass/fail rates, gate durations) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| DAST/pen test requirements | spec | OPTIONAL |
| Threat model review gate | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Every gate must have measurable pass criteria.
- Exceptions require approval and tracking.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-03}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SEC-09}}`, `{{xref:COMP-02}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define stages, code review, and SAST/SCA requirements. |
| intermediate | Required. Define per-gate criteria, evidence, and pre-release checklist. |
| advanced | Required. Add DAST/pen test gates, blocking thresholds, and telemetry metrics. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, scope rule, sast tool, sca update policy, exception rules, optional metrics, dast/pen test/threat model gate, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `sdlc.stages` is UNKNOWN → block Completeness Gate.
- If `gates[].criteria` is UNKNOWN → block Completeness Gate.
- If `codereview.required` is UNKNOWN → block Completeness Gate.
- If `sast.block_threshold` is UNKNOWN → block Completeness Gate.
- If `telemetry.gate_pass_rate_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] stages_and_gates_defined == true
  - [ ] code_review_defined == true
  - [ ] sast_and_sca_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

