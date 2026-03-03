# ADMIN-03 — Audit Trail Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-03                                         |
| Template Type     | Build / Admin                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit trail spec          |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Audit Trail Spec                          |

## 2. Purpose

Define the canonical audit trail model for privileged/admin actions and other security-relevant events: what must be logged, record schema, retention rules, immutability/tamper-evidence expectations, access control to audit logs, and how audit records support investigations. This template must be consistent with AuthZ rules and must not invent audit capabilities not present in upstream inputs.

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

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Audit scope statement | spec | No |
| Audit event types registry | spec | No |
| Audit record schema | spec | No |
| Actor model | spec | No |
| Target/resource model | spec | No |
| Before/after capture policy | spec | Yes |
| Reason requirement | spec | No |
| Retention policy | spec | No |
| Immutability/tamper-evidence policy | spec | Yes |
| Access control policy | spec | No |
| Redaction policy | spec | No |
| Observability requirements | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Export format/policy | ops | OPTIONAL |
| Legal hold policy | compliance | OPTIONAL |
| Correlation to tickets/approvals | ops | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Audit logs MUST be append-only (or UNKNOWN flagged) and resistant to tampering.
- Audit records MUST not store secrets; store references/hashes when needed.
- All privileged/admin actions MUST emit an audit record (or be UNKNOWN flagged).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Access to audit logs MUST be least-privilege and bind to {{xref:API-04}}.

## 7. Cross-References

- **Upstream**: {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-06}} | OPTIONAL, {{xref:GOV-04}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}} | OPTIONAL, {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | Use UNKNOWN for immutability specifics if missing; define record schema skeleton. |
| intermediate | Required | Define retention, access control, and redaction policies. |
| advanced | Required | Add tamper-evidence model and integrity verification procedures. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, risk/retention class, actor metadata (ip/user_agent/session), resource_id/org/project, before/after/diff fields, correlation fields, evidence_refs, capture.mode, capture.required_for, reason.format/codes, retention_by_class, legal_hold_supported, tamper_evidence_model, integrity_verification, who_can_export, export approvals, field_allowlist, alerts, dashboards, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If schema.audit_id or schema.event_type is UNKNOWN → block Completeness Gate.
- If access.who_can_view is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.ADMIN
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] audit_record_schema_defined == true
  - [ ] retention_policy_defined == true
  - [ ] access_control_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

