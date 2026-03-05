# ADMIN-02 — Moderation/Support Tools Spec (queues, actions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-02                                             |
| Template Type     | Build / Admin Tools                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring moderation/support tools spec (queues, actions)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Moderation/Support Tools Spec (queues, actions) Document                         |

## 2. Purpose

Define the canonical specification format for admin moderation/support tools: work queues,
case/ticket model, actions available, safeguards, audit logging, and observability. This template
must be consistent with the admin capabilities matrix and AuthZ rules and must not invent
queues/actions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ADMIN-01 Capabilities Matrix: {{admin.capabilities}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Queue registry (queue_id list)
Queue definition (what items enter, priority)
Case/work item schema (case_id, subject, status, assignee)
Action registry (action_id list)
Action definitions (what they do)
Action safeguards (confirmations, approvals)
Action AuthZ binding (permissions/roles)
Action audit requirements (fields, retention)
Rate limits/abuse controls for admin actions
Observability requirements (queue depth, handling time, action outcomes)

Optional Fields
SLA targets | OPTIONAL
Escalation routing | OPTIONAL
Templates/macros | OPTIONAL
User communication policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new permissions/roles; bind to {{xref:API-04}}.
All actions MUST be auditable (or UNKNOWN flagged).
High-risk actions SHOULD require extra safeguards unless explicitly disallowed.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Queue Registry (by queue_id)
Queue
queue_id: {{queues[0].queue_id}}
name: {{queues[0].name}}
description: {{queues[0].description}}
entry_criteria: {{queues[0].entry_criteria}}
priority_model: {{queues[0].priority_model}} | OPTIONAL
status_model: {{queues[0].status_model}}
assignment_model: {{queues[0].assignment_model}} | OPTIONAL
sla_target: {{queues[0].sla_target}} | OPTIONAL
observability_tags: {{queues[0].observability_tags}} | OPTIONAL
(Repeat for each queue_id.)
2. Work Item / Case Schema
case_id: {{case.case_id}}
subject_type: {{case.subject_type}}
subject_id: {{case.subject_id}} | OPTIONAL
status: {{case.status}}
priority: {{case.priority}} | OPTIONAL
assignee: {{case.assignee}} | OPTIONAL
created_at: {{case.created_at}}
updated_at: {{case.updated_at}}
notes_field: {{case.notes_field}} | OPTIONAL
evidence_refs: {{case.evidence_refs}} | OPTIONAL
3. Action Registry (by action_id)
Action
action_id: {{actions[0].action_id}}

name: {{actions[0].name}}
description: {{actions[0].description}}
applies_to_queue_ids: {{actions[0].applies_to_queue_ids}} | OPTIONAL
preconditions: {{actions[0].preconditions}} | OPTIONAL
effect: {{actions[0].effect}}
safeguards: {{actions[0].safeguards}}
authz_binding: {{actions[0].authz_binding}} (bind to {{xref:API-04}})
audit_required: {{actions[0].audit_required}}
audit_fields: {{actions[0].audit_fields}} | OPTIONAL
rate_limit_ref: {{actions[0].rate_limit_ref}} | OPTIONAL
implementation_refs: {{actions[0].implementation_refs}} | OPTIONAL
rollback_supported: {{actions[0].rollback_supported}} | OPTIONAL
rollback_steps: {{actions[0].rollback_steps}} | OPTIONAL
open_questions:
{{actions[0].open_questions[0]}} | OPTIONAL
(Repeat for each action_id.)
4. Audit Requirements
audit_ref: {{audit.ref}} (expected: {{xref:ADMIN-03}}) | OPTIONAL
retention: {{audit.retention}} | OPTIONAL
redaction_policy: {{audit.redaction_policy}} | OPTIONAL
5. Observability Requirements
metrics:
queue_depth: {{obs.metrics.queue_depth}}
time_to_first_action: {{obs.metrics.time_to_first_action}} | OPTIONAL
time_to_resolve: {{obs.metrics.time_to_resolve}} | OPTIONAL
action_success: {{obs.metrics.action_success}} | OPTIONAL
action_failure: {{obs.metrics.action_failure}} | OPTIONAL
dashboards: {{obs.dashboards}} | OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
6. References
Capabilities matrix: {{xref:ADMIN-01}}
Audit trail: {{xref:ADMIN-03}} | OPTIONAL
Privileged API catalog: {{xref:ADMIN-05}} | OPTIONAL
Admin safeguards: {{xref:ADMIN-06}} | OPTIONAL
AuthZ rules: {{xref:API-04}} | OPTIONAL
Rate limits: {{xref:RLIM-01}} | OPTIONAL
Cross-References
Upstream: {{xref:ADMIN-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-03}}, {{xref:ADMIN-05}}, {{xref:ADMIN-06}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
| OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for queue/action specifics if missing; do not invent
permissions.
intermediate: Required. Define safeguards, authz bindings, and audit fields.
advanced: Required. Add SLA/escalation policies and rollback procedures where applicable.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, priority_model, assignment_model,
sla_target, observability_tags, subject_id, priority, assignee, notes_field, evidence_refs,
applies_to_queue_ids, preconditions, audit_fields, rate_limit_ref, implementation_refs,
rollback_supported, rollback_steps, audit.ref, retention, redaction_policy, dashboards, alerts,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If queue_id list is UNKNOWN → block Completeness Gate.
If action_id list is UNKNOWN → block Completeness Gate.
If authz_binding is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ADMIN
Pass conditions:
required_fields_present == true
queue_registry_defined == true
action_registry_defined == true
audit_requirements_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ADMIN-03

ADMIN-03 — Audit Trail Spec (actions + retention)
Header Block

## 5. Optional Fields

SLA targets | OPTIONAL
Escalation routing | OPTIONAL
Templates/macros | OPTIONAL
User communication policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new permissions/roles; bind to {{xref:API-04}}.
- All actions MUST be auditable (or UNKNOWN flagged).
- **High-risk actions SHOULD require extra safeguards unless explicitly disallowed.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Queue Registry (by queue_id)`
2. `## Queue`
3. `## (Repeat for each queue_id.)`
4. `## Work Item / Case Schema`
5. `## Action Registry (by action_id)`
6. `## Action`
7. `## open_questions:`
8. `## (Repeat for each action_id.)`
9. `## Audit Requirements`
10. `## Observability Requirements`

## 8. Cross-References

- **Upstream: {{xref:ADMIN-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-03}}, {{xref:ADMIN-05}}, {{xref:ADMIN-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
- | OPTIONAL
- Skill Level Requiredness Rules
- **beginner: Required. Use UNKNOWN for queue/action specifics if missing; do not invent**
- permissions.
- **intermediate: Required. Define safeguards, authz bindings, and audit fields.**
- **advanced: Required. Add SLA/escalation policies and rollback procedures where applicable.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, priority_model, assignment_model,**
- sla_target, observability_tags, subject_id, priority, assignee, notes_field, evidence_refs,
- applies_to_queue_ids, preconditions, audit_fields, rate_limit_ref, implementation_refs,
- rollback_supported, rollback_steps, audit.ref, retention, redaction_policy, dashboards, alerts,
- open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If queue_id list is UNKNOWN → block

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
