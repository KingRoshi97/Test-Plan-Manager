# SEC-09 — Security Incident Response Plan

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-09                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring security incident respons |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Security Incident Response Plan           |

## 2. Purpose

Define the canonical security testing plan: SAST, DAST, dependency scanning, pen testing cadence, scope, pass criteria, and remediation workflow. This template must be consistent with Secure SDLC gates, vulnerability management, and the risk register.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Security requirements: `{{xref:SEC-03}}` | OPTIONAL
- Vulnerability management: `{{xref:SEC-04}}` | OPTIONAL
- Secure SDLC: `{{xref:SEC-07}}` | OPTIONAL
- Risk register: `{{xref:TMA-04}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Testing types list (SAST, SCA, DAST, pen test) | spec | No |
| SAST: tool, scope, run frequency, block threshold | spec | No |
| SCA: tool, scope, run frequency, block threshold | spec | No |
| DAST: tool, scope, run frequency, block threshold | spec | Yes |
| Pen test: scope, cadence, provider type (internal/external) | spec | Yes |
| Pass criteria per test type | spec | No |
| Remediation workflow for findings | spec | No |
| Evidence artifacts produced (reports, scan results) | spec | No |
| Telemetry requirements (findings count, pass/fail rates) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Bug bounty program | spec | OPTIONAL |
| Red team exercise plan | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Tests must produce evidence.
- Findings above the block threshold must be remediated before release.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-07}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:TMA-09}}`, `{{xref:SEC-04}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define SAST and SCA requirements and pass criteria. |
| intermediate | Required. Define DAST, pen test cadence, and remediation workflow. |
| advanced | Required. Add evidence artifacts, telemetry, and bug bounty/red team planning. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, DAST fields (if not applicable), pen test fields (if not planned), storage location, optional metrics, bug bounty/red team, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `testing.types` is UNKNOWN → block Completeness Gate.
- If `sast.block_threshold` is UNKNOWN → block Completeness Gate.
- If `sca.block_threshold` is UNKNOWN → block Completeness Gate.
- If `pass.criteria` is UNKNOWN → block Completeness Gate.
- If `telemetry.findings_count_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] sast_and_sca_defined == true
  - [ ] pass_criteria_defined == true
  - [ ] remediation_defined == true
  - [ ] evidence_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

