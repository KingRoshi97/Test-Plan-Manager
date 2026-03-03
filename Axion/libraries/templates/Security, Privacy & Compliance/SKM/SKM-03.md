# SKM-03 — Key Rotation Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-03                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring key rotation policy       |
| Filled By         | Internal Agent                                   |
| Consumes          | SKM-01, SKM-02, SEC-04                           |
| Produces          | Filled Key Rotation Policy                       |

## 2. Purpose

Define the canonical rotation policy for secrets, keys, and certificates: rotation schedules by type, trigger-based rotations (compromise), overlap windows, and how rotations are executed and verified. This template must align with secrets inventory, storage policy, and vulnerability/incident processes.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets inventory: {{xref:SKM-01}} | OPTIONAL
- Storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Vulnerability management: {{xref:SEC-04}} | OPTIONAL
- Privileged audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Rotation schedule by secret type (api keys, oauth, jwt keys, tls certs) | No |
| Rotation triggers list (time-based, compromise, employee exit) | No |
| Overlap window rule (dual validity) | No |
| Rotation execution workflow (steps) | No |
| Verification rule (prove new secret in use) | No |
| Rollback rule (if rotation breaks prod) | No |
| Emergency rotation rule (incident) | No |
| Ownership rules (who rotates) | No |
| Audit requirements (rotation events logged) | No |
| Telemetry requirements (rotation success/fail, expired secrets) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Automated rotation support | OPTIONAL |
| Key ceremony notes (for signing keys) | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Rotation must not require exposing secret material in plaintext to humans.
- Overlap windows must be bounded.
- Emergency rotation must be runnable under incident response constraints.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SKM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SKM-08}}, {{xref:SKM-10}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define schedule, triggers, workflow, and rollback rule. |
| Intermediate | Required. Define overlap window and verification evidence and audit events. |
| Advanced | Required. Add automated rotation and key ceremony notes and incident-friendly emergency steps. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, optional schedules, dual valid rule, evidence rule, approvals, optional metrics, automation/ceremony, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If sched.api_key_days is UNKNOWN → block Completeness Gate.
- If triggers.list is UNKNOWN → block Completeness Gate.
- If overlap.window_seconds is UNKNOWN → block Completeness Gate.
- If verify.rule is UNKNOWN → block Completeness Gate.
- If telemetry.success_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] schedules_and_triggers_defined == true
  - [ ] workflow_and_verification_defined == true
  - [ ] rollback_and_emergency_defined == true
  - [ ] audit_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

