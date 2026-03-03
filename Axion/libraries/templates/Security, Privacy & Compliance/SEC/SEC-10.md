# SEC-10 — Security Observability

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-10                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring security observability    |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Security Observability                    |

## 2. Purpose

Define the canonical runbooks for security operations: step-by-step procedures for responding to alerts, incidents, and threat scenarios. Each runbook must link to a triggering signal, required permissions, evidence capture, and escalation rules. This template must align with incident response plans and TMA runbooks.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Incident response plan: `{{xref:SEC-05}}` | OPTIONAL
- Security monitoring: `{{xref:SEC-06}}` | OPTIONAL
- TMA runbooks: `{{xref:TMA-10}}` | OPTIONAL
- Secrets compromise response: `{{xref:SKM-08}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Runbook registry (runbook_id list) | spec | No |
| runbook_id (stable identifier) | spec | No |
| Trigger signal/alert reference | spec | No |
| Triage steps (ordered) | spec | No |
| Response actions (ordered) | spec | No |
| Evidence capture checklist | spec | No |
| Escalation rules (when to involve security/legal) | spec | No |
| Permissions required | spec | No |
| Audit requirements | spec | No |
| Telemetry requirements (invocations, time-to-resolve) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Automation hooks | spec | OPTIONAL |
| Customer comms pointers | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Every runbook must be linked to a trigger signal or alert.
- Response actions must be permissioned and auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-05}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:AUDIT-10}}`, `{{xref:TMA-10}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define registry, triggers, and triage/action steps per runbook. |
| intermediate | Required. Define evidence, escalation, and permissions/audit per runbook. |
| advanced | Required. Add automation hooks, customer comms pointers, and telemetry detail. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, meta notes, optional steps, ttr metric, automation hooks, customer comms, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `books[].runbook_id` is UNKNOWN → block Completeness Gate.
- If `books[].trigger` is UNKNOWN → block Completeness Gate.
- If `books[].triage_steps[0]` is UNKNOWN → block Completeness Gate.
- If `books[].actions[0]` is UNKNOWN → block Completeness Gate.
- If `books[*].telemetry.invoked_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] runbooks_defined == true
  - [ ] each_runbook_has_trigger_and_actions == true
  - [ ] permissions_and_audit_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

