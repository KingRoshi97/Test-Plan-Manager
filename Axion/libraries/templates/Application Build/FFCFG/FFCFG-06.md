# FFCFG-06 — Audit & Change Control (who can flip, logging)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-06                                             |
| Template Type     | Build / Feature Flags                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring audit & change control (who can flip, logging)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Audit & Change Control (who can flip, logging) Document                         |

## 2. Purpose

Define the canonical audit and change control policy for feature flags: who can change flags,
what approvals are required, what must be logged, how changes are reviewed, and how
emergency changes are handled. This template must be consistent with AuthZ rules and must
not invent permissions or actors not present in upstream inputs.

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

Authority model (who can change flags; required permissions)
Change types (create/update/delete/retire, targeting changes, ramp changes, kill-switch)
Approval policy (none/one-person/two-person/UNKNOWN)
Logging requirements (fields captured for each change)
Audit storage location / retention policy
Emergency change policy (break-glass)
Rollback policy for mistaken changes
Review cadence (periodic audit review)
Access to audit logs (who can view)
Observability requirements (flag change metrics/alerts)

Optional Fields
Ticket/change request linkage | OPTIONAL
Notifications policy (who gets notified) | OPTIONAL
Per-environment stricter controls | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new roles/permissions; bind to {{xref:API-04}}.
All flag changes MUST be logged with actor + before/after + reason (or UNKNOWN flagged).
Emergency changes MUST be audited and time-bounded if possible.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Audit trail format MUST bind to {{xref:ADMIN-03}} if present (or UNKNOWN).
Output Format
1. Authority Model
who_can_change_flags: {{auth.who_can_change_flags}}
required_permissions: {{auth.required_permissions}} | OPTIONAL
env_restrictions: {{auth.env_restrictions}} | OPTIONAL
2. Change Types
supported_change_types:
{{changes.types[0]}}
{{changes.types[1]}}
{{changes.types[2]}}
3. Approval Policy
approval_model: {{approval.model}} (none/one_person/two_person/UNKNOWN)
approval_required_for: {{approval.required_for}} | OPTIONAL
approvers: {{approval.approvers}} | OPTIONAL
4. Logging Requirements (Audit Record)
audit_record_fields:
timestamp: {{audit.fields.timestamp}}
flag_id: {{audit.fields.flag_id}}
change_type: {{audit.fields.change_type}}
actor: {{audit.fields.actor}}
env: {{audit.fields.env}} | OPTIONAL
before: {{audit.fields.before}}
after: {{audit.fields.after}}
reason: {{audit.fields.reason}}
request_id: {{audit.fields.request_id}} | OPTIONAL
trace_id: {{audit.fields.trace_id}} | OPTIONAL
ticket_ref: {{audit.fields.ticket_ref}} | OPTIONAL

audit_storage: {{audit.storage}}
retention: {{audit.retention}} | OPTIONAL
5. Emergency Change Policy (Break-Glass)
break_glass_supported: {{emergency.supported}}
who_can_break_glass: {{emergency.who}} | OPTIONAL
allowed_changes: {{emergency.allowed_changes}} | OPTIONAL
time_bounds: {{emergency.time_bounds}} | OPTIONAL
postmortem_required: {{emergency.postmortem_required}} | OPTIONAL
6. Rollback Policy
rollback_supported: {{rollback.supported}}
rollback_method: {{rollback.method}} (revert/audit_replay/UNKNOWN)
rollback_requirements: {{rollback.requirements}} | OPTIONAL
7. Review Cadence
review_frequency: {{review.frequency}}
review_owners: {{review.owners}} | OPTIONAL
review_checklist: {{review.checklist}} | OPTIONAL
8. Audit Log Access
who_can_view_audit: {{access.who_can_view_audit}}
redaction_policy: {{access.redaction_policy}} | OPTIONAL
9. Observability Requirements
metrics:
flag_change_count: {{obs.metrics.flag_change_count}}
kill_switch_activations: {{obs.metrics.kill_switch_activations}} | OPTIONAL
unauthorized_change_attempts: {{obs.metrics.unauthorized_change_attempts}} |
OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
notifications: {{obs.notifications}} | OPTIONAL
10.References
Flag registry: {{xref:FFCFG-01}}
Behavior specs: {{xref:FFCFG-02}} | OPTIONAL
Rollout plans: {{xref:FFCFG-03}} | OPTIONAL
AuthZ rules: {{xref:API-04}} | OPTIONAL
Audit trail spec: {{xref:ADMIN-03}} | OPTIONAL
Cross-References
Upstream: {{xref:FFCFG-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-03}} | OPTIONAL, {{xref:OPS-OBS}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
| OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for approvals/retention if missing; do not invent
permissions.

intermediate: Required. Define logging fields and rollback/emergency policy.
advanced: Required. Add env-specific controls, review cadence, and alerting/notifications rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, required_permissions, env_restrictions,
approval_required_for, approvers, retention, request_id/trace_id, ticket_ref,
who_can_break_glass, allowed_changes, time_bounds, postmortem_required,
rollback_requirements, review_owners, review_checklist, redaction_policy, alerts, notifications,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If audit_storage is UNKNOWN → block Completeness Gate.
If who_can_change_flags is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FFCFG
Pass conditions:
required_fields_present == true
authority_model_defined == true
audit_record_fields_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
●

API Pagination/Filtering/Sorting (PFS)

API Pagination/Filtering/Sorting (PFS)
PFS-01 Query Contract (filter/sort operators, syntax)
PFS-02 Pagination Rules (cursor/offset, stability guarantees)
PFS-03 Default Ordering & Tie-Break Rules
PFS-04 Validation & Error Mapping (bad query → reason codes)
PFS-05 Performance Constraints (limits, indexed fields policy)

PFS-01

PFS-01 — Query Contract (filter/sort operators, syntax)
Header Block

## 5. Optional Fields

Ticket/change request linkage | OPTIONAL
Notifications policy (who gets notified) | OPTIONAL
Per-environment stricter controls | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new roles/permissions; bind to {{xref:API-04}}.
- All flag changes MUST be logged with actor + before/after + reason (or UNKNOWN flagged).
- **Emergency changes MUST be audited and time-bounded if possible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Audit trail format MUST bind to {{xref:ADMIN-03}} if present (or UNKNOWN).**

## 7. Output Format

### Required Headings (in order)

1. `## Authority Model`
2. `## Change Types`
3. `## supported_change_types:`
4. `## Approval Policy`
5. `## Logging Requirements (Audit Record)`
6. `## audit_record_fields:`
7. `## Emergency Change Policy (Break-Glass)`
8. `## Rollback Policy`
9. `## Review Cadence`
10. `## Audit Log Access`

## 8. Cross-References

- **Upstream: {{xref:FFCFG-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-03}} | OPTIONAL, {{xref:OPS-OBS}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
- | OPTIONAL

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
