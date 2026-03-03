# SEC-04 — Authorization Model

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-04                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring authorization model       |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Authorization Model                       |

## 2. Purpose

Define the canonical vulnerability management program for the product: scanning, triage, patch SLAs by severity, dependency management, and verification/closure workflow. This template must be consistent with Secure SDLC gates and compliance control expectations.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Security requirements baseline: `{{xref:SEC-03}}` | OPTIONAL
- Secure SDLC policy: `{{xref:SEC-07}}` | OPTIONAL
- Control matrix: `{{xref:COMP-02}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Vulnerability sources list (SAST, SCA, DAST, pen test, bug reports) | spec | No |
| Severity model (critical/high/med/low) | spec | No |
| Patch SLA by severity (days) | spec | No |
| Triage workflow (intake → assess → assign → fix → verify → close) | spec | No |
| Ownership rules (who fixes, who approves risk) | spec | No |
| Dependency update policy (SCA handling) | spec | No |
| Exception/waiver rules (SEC-08) | spec | Yes |
| Verification requirements (proof of fix) | spec | No |
| Reporting cadence (weekly/monthly) | spec | No |
| Telemetry requirements (open vulns by severity, SLA breaches) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Coordinated disclosure policy | spec | OPTIONAL |
| Asset inventory linkage | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- SLA must be explicit and enforceable.
- Exceptions must have expiries and approvals.
- Verification must be recorded (evidence pointer).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-03}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SEC-05}}`, `{{xref:SEC-09}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define sources, SLAs, and workflow steps; mark UNKNOWN where tooling is unknown. |
| intermediate | Required. Define ownership, dependency policy, and verification evidence. |
| advanced | Required. Add threshold gating, reporting rigor, and telemetry/SLA breach monitoring detail. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, definitions, low SLA, extra workflow steps, risk acceptance owner, blocked threshold, waiver rules, report location, optional telemetry metrics, disclosure/asset linkage, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `vuln.sources` is UNKNOWN → block Completeness Gate.
- If `sla.critical_days` is UNKNOWN → block Completeness Gate.
- If `workflow.steps[0]` is UNKNOWN → block Completeness Gate.
- If `verify.evidence_required` is UNKNOWN → block Completeness Gate.
- If `telemetry.open_vulns_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] sla_defined == true
  - [ ] workflow_defined == true
  - [ ] verification_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

