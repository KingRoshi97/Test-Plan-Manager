# ADMIN-03 — Audit Trail Spec (actions + retention)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-03                                             |
| Template Type     | Build / Admin Tools                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring audit trail spec (actions + retention)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Audit Trail Spec (actions + retention) Document                         |

## 2. Purpose

Define the canonical audit trail model for privileged/admin actions and other security-relevant
events: what must be logged, record schema, retention rules, immutability/tamper-evidence
expectations, access control to audit logs, and how audit records support investigations. This
template must be consistent with AuthZ rules and must not invent audit capabilities not present
in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-01 Admin Capabilities Matrix: {{admin.capabilities}} | OPTIONAL
- ADMIN-02 Moderation/Support Tools Spec: {{admin.tools_spec}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Audit scope statement (what categories of actions are audited)
Audit event types registry (event_type list)
Audit record schema (fields required)
Actor model (user/service, roles, ip/device if applicable)
Target/resource model (what was acted on)
Before/after capture policy (diff vs snapshot)
Reason requirement (why field required)
Retention policy (duration by event type/class)
Immutability/tamper-evidence policy (append-only, hashing)
Access control policy (who can view/export)
Redaction policy (no secrets, PII handling)
Observability requirements (audit write failures, volume)

Optional Fields
Export format/policy | OPTIONAL
Legal hold policy | OPTIONAL
Correlation to tickets/approvals | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Audit logs MUST be append-only (or UNKNOWN flagged) and resistant to tampering.
Audit records MUST not store secrets; store references/hashes when needed.
All privileged/admin actions MUST emit an audit record (or be UNKNOWN flagged).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Access to audit logs MUST be least-privilege and bind to {{xref:API-04}}.
Output Format
1. Audit Scope
audited_categories: {{audit.scope.categories}}
audited_surfaces: {{audit.scope.surfaces}} | OPTIONAL
notes: {{audit.scope.notes}} | OPTIONAL
2. Audit Event Types Registry
Event Type
event_type: {{types[0].event_type}}
name: {{types[0].name}}
description: {{types[0].description}}
risk_class: {{types[0].risk_class}} | OPTIONAL
retention_class: {{types[0].retention_class}} | OPTIONAL
(Repeat for each event_type.)
3. Audit Record Schema
audit_id: {{schema.audit_id}}
event_type: {{schema.event_type}}
timestamp: {{schema.timestamp}}
actor:
actor_type: {{schema.actor.actor_type}} (user/service/UNKNOWN)
actor_id: {{schema.actor.actor_id}}
roles: {{schema.actor.roles}} | OPTIONAL
ip: {{schema.actor.ip}} | OPTIONAL
user_agent: {{schema.actor.user_agent}} | OPTIONAL
session_id: {{schema.actor.session_id}} | OPTIONAL
target:
resource_type: {{schema.target.resource_type}}

resource_id: {{schema.target.resource_id}} | OPTIONAL
org_id: {{schema.target.org_id}} | OPTIONAL
project_id: {{schema.target.project_id}} | OPTIONAL
action:
action_id: {{schema.action.action_id}}
decision: {{schema.action.decision}} (allow/deny/UNKNOWN) | OPTIONAL
reason: {{schema.action.reason}}
before: {{schema.before}} | OPTIONAL
after: {{schema.after}} | OPTIONAL
diff: {{schema.diff}} | OPTIONAL
correlation:
request_id: {{schema.correlation.request_id}} | OPTIONAL
trace_id: {{schema.correlation.trace_id}} | OPTIONAL
ticket_ref: {{schema.correlation.ticket_ref}} | OPTIONAL
approval_ref: {{schema.correlation.approval_ref}} | OPTIONAL
redaction_applied: {{schema.redaction_applied}} | OPTIONAL
evidence_refs: {{schema.evidence_refs}} | OPTIONAL
4. Before/After Capture Policy
capture_mode: {{capture.mode}} (diff/snapshot/both/UNKNOWN)
capture_required_for: {{capture.required_for}} | OPTIONAL
sensitive_field_handling: {{capture.sensitive_field_handling}}
5. Reason Policy
reason_required: {{reason.required}}
reason_format: {{reason.format}} | OPTIONAL
reason_codes: {{reason.codes}} | OPTIONAL
6. Retention Policy
default_retention: {{retention.default}}
retention_by_class: {{retention.by_class}} | OPTIONAL
legal_hold_supported: {{retention.legal_hold_supported}} | OPTIONAL
7. Immutability / Tamper-Evidence
append_only: {{immutability.append_only}}
tamper_evidence_model: {{immutability.model}} (hash_chain/worm/UNKNOWN)
integrity_verification: {{immutability.integrity_verification}} | OPTIONAL
8. Access Control
who_can_view: {{access.who_can_view}}
who_can_export: {{access.who_can_export}} | OPTIONAL
export_approval_required: {{access.export_approval_required}} | OPTIONAL
9. Redaction Policy
pii_redaction: {{redaction.pii_redaction}}

secrets_redaction: {{redaction.secrets_redaction}}
field_allowlist: {{redaction.field_allowlist}} | OPTIONAL
10.Observability Requirements
metrics:
audit_write_success: {{obs.metrics.audit_write_success}}
audit_write_failure: {{obs.metrics.audit_write_failure}}
audit_volume: {{obs.metrics.audit_volume}} | OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
dashboards: {{obs.dashboards}} | OPTIONAL
11.References
Admin capabilities: {{xref:ADMIN-01}} | OPTIONAL
Moderation/support tools: {{xref:ADMIN-02}} | OPTIONAL
Privileged surface catalog: {{xref:ADMIN-05}} | OPTIONAL
Admin safeguards: {{xref:ADMIN-06}} | OPTIONAL
AuthZ rules: {{xref:API-04}} | OPTIONAL
Cross-References
Upstream: {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-06}} | OPTIONAL, {{xref:GOV-04}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
| OPTIONAL, {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for immutability specifics if missing; define record schema
skeleton.
intermediate: Required. Define retention, access control, and redaction policies.
advanced: Required. Add tamper-evidence model and integrity verification procedures.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, risk/retention class, actor metadata
(ip/user_agent/session), resource_id/org/project, before/after/diff fields, correlation fields,
evidence_refs, capture.mode, capture.required_for, reason.format/codes, retention_by_class,
legal_hold_supported, tamper_evidence_model, integrity_verification, who_can_export, export
approvals, field_allowlist, alerts, dashboards, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If schema.audit_id or schema.event_type is UNKNOWN → block Completeness Gate.
If access.who_can_view is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ADMIN
Pass conditions:
required_fields_present == true
audit_record_schema_defined == true

retention_policy_defined == true
access_control_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ADMIN-04

ADMIN-04 — Data Repair Procedures (safe backfills)
Header Block

## 5. Optional Fields

Export format/policy | OPTIONAL
Legal hold policy | OPTIONAL
Correlation to tickets/approvals | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Audit logs MUST be append-only (or UNKNOWN flagged) and resistant to tampering.**
- **Audit records MUST not store secrets; store references/hashes when needed.**
- All privileged/admin actions MUST emit an audit record (or be UNKNOWN flagged).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Access to audit logs MUST be least-privilege and bind to {{xref:API-04}}.**

## 7. Output Format

### Required Headings (in order)

1. `## Audit Scope`
2. `## Audit Event Types Registry`
3. `## Event Type`
4. `## (Repeat for each event_type.)`
5. `## Audit Record Schema`
6. `## actor:`
7. `## target:`
8. `## action:`
9. `## correlation:`
10. `## Before/After Capture Policy`

## 8. Cross-References

- **Upstream: {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-06}} | OPTIONAL, {{xref:GOV-04}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
- | OPTIONAL, {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
