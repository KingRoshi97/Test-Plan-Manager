# SKM-08 — Compromise Response (detect, rotate, revoke, audit)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-08                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring compromise response (detect, rotate, revoke, audit)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Compromise Response (detect, rotate, revoke, audit) Document                         |

## 2. Purpose

Define the canonical response procedure when a secret/key is suspected or confirmed
compromised: detection, containment, rotation, revocation, audit, and recovery verification. This
template must align with incident response and rotation policies.

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

Compromise triggers (what indicates compromise)
Immediate containment actions (disable key, block traffic)
Secret classification (high-risk vs low-risk)
Rotation procedure (how to rotate safely)
Revocation procedure (invalidate old)
Dependency update rule (services that must reload)
Verification rule (prove old key no longer works)
Audit logging requirements (who rotated/revoked)
Communication/escalation rules (who notified)
Telemetry requirements (compromise events, time-to-rotate)

Optional Fields
Customer notification rules | OPTIONAL
Post-incident follow-ups | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Containment must be fast and permissioned.
Rotation must not expose secret material to humans.
Verification must be explicit (attempt auth with old key should fail).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Triggers
triggers: {{triggers.list}}
2. Containment
actions: {{contain.actions}}
permission_rule: {{contain.permission_rule}} | OPTIONAL
3. Classification
risk_tiers: {{class.risk_tiers}}
tiering_rule: {{class.tiering_rule}} | OPTIONAL
4. Rotation
rotation_steps: {{rotate.steps}}
overlap_rule: {{rotate.overlap_rule}} | OPTIONAL
5. Revocation
revoke_steps: {{revoke.steps}}
propagation_rule: {{revoke.propagation_rule}} | OPTIONAL
6. Dependency Updates
reload_rule: {{deps.reload_rule}}
services_impacted: {{deps.services_impacted}} | OPTIONAL
7. Verification
verification_steps: {{verify.steps}}
success_criteria: {{verify.success_criteria}} | OPTIONAL
8. Audit
audit_required: {{audit.required}}
audit_events: {{audit.events}} | OPTIONAL
9. Communications / Escalation
notify_rule: {{comms.notify_rule}}
escalate_rule: {{comms.escalate_rule}} | OPTIONAL
10.Telemetry
compromise_event_metric: {{telemetry.compromise_event_metric}}
time_to_rotate_metric: {{telemetry.time_to_rotate_metric}} | OPTIONAL
11.References
Incident response: {{xref:SEC-05}} | OPTIONAL

Rotation policy: {{xref:SKM-03}} | OPTIONAL
Access policy: {{xref:SKM-02}} | OPTIONAL
Security runbooks: {{xref:SEC-10}} | OPTIONAL
Cross-References
Upstream: {{xref:SEC-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SEC-10}}, {{xref:SEC-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define triggers, containment actions, and rotate/revoke steps.
intermediate: Required. Define dependency reload rule, verification steps, and audit/telemetry.
advanced: Required. Add tiering rules, customer comms, and post-incident follow-ups rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, permission rule, tiering rule,
overlap/propagation rules, impacted services, success criteria, audit events, escalate/customer
comms, time-to-rotate metric, follow-ups, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If triggers.list is UNKNOWN → block Completeness Gate.
If contain.actions is UNKNOWN → block Completeness Gate.
If rotate.steps is UNKNOWN → block Completeness Gate.
If revoke.steps is UNKNOWN → block Completeness Gate.
If telemetry.compromise_event_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SKM
Pass conditions:
required_fields_present == true
triggers_and_containment_defined == true
rotate_and_revoke_defined == true
verification_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SKM-09

SKM-09 — Logging & Redaction Rules (no secrets in logs)
Header Block

## 5. Optional Fields

Customer notification rules | OPTIONAL
Post-incident follow-ups | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Containment must be fast and permissioned.**
- **Rotation must not expose secret material to humans.**
- **Verification must be explicit (attempt auth with old key should fail).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Triggers`
2. `## Containment`
3. `## Classification`
4. `## Rotation`
5. `## Revocation`
6. `## Dependency Updates`
7. `## Verification`
8. `## Audit`
9. `## Communications / Escalation`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:SEC-05}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-10}}, {{xref:SEC-06}} | OPTIONAL**
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
