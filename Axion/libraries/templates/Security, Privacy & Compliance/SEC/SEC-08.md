# SEC-08 — Security Testing Requirements

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-08                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring security testing requirem |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Security Testing Requirements             |

## 2. Purpose

Define the canonical process and registry for security exceptions, waivers, and risk acceptances: how exceptions are requested, approved, tracked, and reviewed. This document ensures that all deviations from the security baseline are explicit, time-bounded, and reviewed.

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
| Exception types (waiver, risk acceptance, deferral) | spec | No |
| Request process (who, how, required fields) | spec | No |
| Approval authority (by severity) | spec | No |
| Maximum exception duration (days) | spec | No |
| Required justification fields | spec | No |
| Tracking registry (exception_id list) | spec | No |
| Review cadence (periodic check for expired/open exceptions) | spec | No |
| Audit logging requirements (exception events) | spec | No |
| Telemetry requirements (open exceptions count, expired count) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Compensating controls requirements | spec | OPTIONAL |
| Escalation rules for expired exceptions | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Exceptions must have an expiry date.
- Approval must be recorded with approver identity.
- Expired exceptions must trigger review.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-03}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:TMA-04}}`, `{{xref:COMP-02}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define types, request process, and approval authority. |
| intermediate | Required. Define duration, registry, and review cadence. |
| advanced | Required. Add compensating controls, audit events, and telemetry detail. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, submission mechanism, approval by severity, compensating controls, expired rule, optional metrics, escalation rules, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `exc.types` is UNKNOWN → block Completeness Gate.
- If `approval.authority` is UNKNOWN → block Completeness Gate.
- If `duration.max_days` is UNKNOWN → block Completeness Gate.
- If `review.cadence` is UNKNOWN → block Completeness Gate.
- If `telemetry.open_exceptions_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] types_and_process_defined == true
  - [ ] approval_and_duration_defined == true
  - [ ] registry_defined == true
  - [ ] audit_and_telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

