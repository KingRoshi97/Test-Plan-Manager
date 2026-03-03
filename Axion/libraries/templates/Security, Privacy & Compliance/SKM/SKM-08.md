# SKM-08 — Emergency Rotation Procedures

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-08                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring emergency rotation proced |
| Filled By         | Internal Agent                                   |
| Consumes          | SEC-05, SKM-03, SKM-02                           |
| Produces          | Filled Emergency Rotation Procedures             |

## 2. Purpose

Define the canonical response procedure when a secret/key is suspected or confirmed compromised: detection, containment, rotation, revocation, audit, and recovery verification. This template must align with incident response and rotation policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Incident response plan: {{xref:SEC-05}} | OPTIONAL
- Secrets inventory: {{xref:SKM-01}} | OPTIONAL
- Storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Rotation policy: {{xref:SKM-03}} | OPTIONAL
- Forensics runbooks: {{xref:AUDIT-10}} | OPTIONAL
- Security monitoring: {{xref:SEC-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Compromise triggers (what indicates compromise) | No |
| Immediate containment actions (disable key, block traffic) | No |
| Secret classification (high-risk vs low-risk) | Yes |
| Rotation procedure (how to rotate safely) | No |
| Revocation procedure (invalidate old) | No |
| Dependency update rule (services that must reload) | No |
| Verification rule (prove old key no longer works) | No |
| Audit logging requirements (who rotated/revoked) | No |
| Communication/escalation rules (who notified) | No |
| Telemetry requirements (compromise events, time-to-rotate) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Customer notification rules | OPTIONAL |
| Post-incident follow-ups | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Containment must be fast and permissioned.
- Rotation must not expose secret material to humans.
- Verification must be explicit (attempt auth with old key should fail).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SEC-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SEC-10}}, {{xref:SEC-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define triggers, containment actions, and rotate/revoke steps. |
| Intermediate | Required. Define dependency reload rule, verification steps, and audit/telemetry. |
| Advanced | Required. Add tiering rules, customer comms, and post-incident follow-ups rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, permission rule, tiering rule, overlap/propagation rules, impacted services, success criteria, audit events, escalate/customer comms, time-to-rotate metric, follow-ups, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If triggers.list is UNKNOWN → block Completeness Gate.
- If contain.actions is UNKNOWN → block Completeness Gate.
- If rotate.steps is UNKNOWN → block Completeness Gate.
- If revoke.steps is UNKNOWN → block Completeness Gate.
- If telemetry.compromise_event_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] triggers_and_containment_defined == true
- [ ] rotate_and_revoke_defined == true
- [ ] verification_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

