# FFCFG-06 — Audit & Change Control

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-06                                         |
| Template Type     | Build / Feature Flags                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit & change control    |
| Filled By         | Internal Agent                                   |
| Consumes          | FFCFG-01, FFCFG-02, FFCFG-03                     |
| Produces          | Filled Audit & Change Control                    |

## 2. Purpose

Define the canonical audit and change control policy for feature flags: who can change flags, what approvals are required, what must be logged, how changes are reviewed, and how emergency changes are handled. This template must be consistent with AuthZ rules and must not invent permissions or actors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}}
- FFCFG-02 Flag Behavior Specs: {{ffcfg.behavior_specs}} | OPTIONAL
- FFCFG-03 Rollout Plans: {{ffcfg.rollout_plans}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Authority model (who can change flags; required permissions) | spec | No |
| Change types (create/update/delete/retire, targeting changes, ramp changes, kill-switch) | spec | No |
| Approval policy (none/one-person/two-person/UNKNOWN) | spec | Yes |
| Logging requirements (fields captured for each change) | spec | No |
| Audit storage location / retention policy | spec | No |
| Emergency change policy (break-glass) | spec | No |
| Rollback policy for mistaken changes | spec | No |
| Review cadence (periodic audit review) | spec | No |
| Access to audit logs (who can view) | spec | No |
| Observability requirements (flag change metrics/alerts) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Ticket/change request linkage | spec | OPTIONAL |
| Notifications policy (who gets notified) | spec | OPTIONAL |
| Per-environment stricter controls | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new roles/permissions; bind to {{xref:API-04}}.
- All flag changes MUST be logged with actor + before/after + reason (or UNKNOWN flagged).
- Emergency changes MUST be audited and time-bounded if possible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Audit trail format MUST bind to {{xref:ADMIN-03}} if present (or UNKNOWN).

## 7. Cross-References

- **Upstream**: {{xref:FFCFG-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-03}} | OPTIONAL, {{xref:OPS-OBS}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN for approvals/retention if missing; do not invent permissions. | Required. Define logging fields and rollback/emergency policy. | Required. Add env-specific controls, review cadence, and alerting/notifications rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, required_permissions, env_restrictions, approval_required_for, approvers, retention, request_id/trace_id, ticket_ref, who_can_break_glass, allowed_changes, time_bounds, postmortem_required, rollback_requirements, review_owners, review_checklist, redaction_policy, alerts, notifications, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If audit_storage is UNKNOWN → block Completeness Gate.
- If who_can_change_flags is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FFCFG
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] authority_model_defined == true
  - [ ] audit_record_fields_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

