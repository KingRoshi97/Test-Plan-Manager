# ADMIN-02 — Moderation/Support Tools Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-02                                         |
| Template Type     | Build / Admin                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring moderation/support tools  |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Moderation/Support Tools Spec             |

## 2. Purpose

Define the canonical specification format for admin moderation/support tools: work queues, case/ticket model, actions available, safeguards, audit logging, and observability. This template must be consistent with the admin capabilities matrix and AuthZ rules and must not invent queues/actions not present in upstream inputs.

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

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Queue registry (queue_id list) | spec | No |
| Queue definition (what items enter, priority) | spec | No |
| Case/work item schema | spec | No |
| Action registry (action_id list) | spec | No |
| Action definitions | spec | No |
| Action safeguards | spec | Yes |
| Action AuthZ binding | API-04 | No |
| Action audit requirements | ADMIN-03 | Yes |
| Rate limits/abuse controls for admin actions | RLIM | Yes |
| Observability requirements | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| SLA targets | ops | OPTIONAL |
| Escalation routing | ops | OPTIONAL |
| Templates/macros | spec | OPTIONAL |
| User communication policy | spec | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new permissions/roles; bind to {{xref:API-04}}.
- All actions MUST be auditable (or UNKNOWN flagged).
- High-risk actions SHOULD require extra safeguards unless explicitly disallowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:ADMIN-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-03}}, {{xref:ADMIN-05}}, {{xref:ADMIN-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | Use UNKNOWN for queue/action specifics if missing; do not invent permissions. |
| intermediate | Required | Define safeguards, authz bindings, and audit fields. |
| advanced | Required | Add SLA/escalation policies and rollback procedures where applicable. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, priority_model, assignment_model, sla_target, observability_tags, subject_id, priority, assignee, notes_field, evidence_refs, applies_to_queue_ids, preconditions, audit_fields, rate_limit_ref, implementation_refs, rollback_supported, rollback_steps, audit.ref, retention, redaction_policy, dashboards, alerts, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If queue_id list is UNKNOWN → block Completeness Gate.
- If action_id list is UNKNOWN → block Completeness Gate.
- If authz_binding is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.ADMIN
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] queue_registry_defined == true
  - [ ] action_registry_defined == true
  - [ ] audit_requirements_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

