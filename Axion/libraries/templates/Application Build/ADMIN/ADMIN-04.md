# ADMIN-04 — Data Repair Procedures

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-04                                         |
| Template Type     | Build / Admin                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring data repair procedures    |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Data Repair Procedures                    |

## 2. Purpose

Define the canonical procedures and constraints for performing safe data repairs (manual fixes, backfills, replays, reconciliations), including approvals, dry runs, idempotency, rate limits, audit logging, and rollback/verification. This template must be consistent with audit/AuthZ rules and must not invent repair capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ADMIN-01 Capabilities Matrix: {{admin.capabilities}}
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- EVT-07 Failure Handling (replay/backfill): {{evt.failure_handling}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jbs.retry_dlq}} | OPTIONAL
- JBS-05 Idempotency & Concurrency: {{jbs.idempotency_concurrency}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Repair action types | spec | No |
| Eligibility rules | spec | No |
| Approval policy | spec | No |
| Safety checklist (pre-flight checks) | spec | No |
| Dry-run policy | spec | Yes |
| Execution method | spec | Yes |
| Idempotency requirements for repair operations | JBS-05 | No |
| Concurrency/rate limit constraints for repairs | RLIM | Yes |
| Audit logging requirements | ADMIN-03 | No |
| Rollback/compensation policy | spec | Yes |
| Verification steps | spec | No |
| Communication policy | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Feature-flag gated repairs | FFCFG | OPTIONAL |
| Quarantine mode | spec | OPTIONAL |
| Incident/ticket linkage | ops | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- All repair actions MUST be auditable per {{xref:ADMIN-03}}.
- AuthZ for repairs MUST bind to {{xref:API-04}}.
- Repairs that replay events MUST respect {{xref:EVT-07}} semantics.
- Job-based repairs MUST respect {{xref:JBS-04}} and {{xref:JBS-05}} when applicable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:ADMIN-01}}, {{xref:ADMIN-03}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-06}} | OPTIONAL, {{xref:RUNBOOK-REPAIR}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | Use UNKNOWN for execution entry points if missing; do not invent repair powers. |
| intermediate | Required | Define dry-run, idempotency, audit, and verification steps. |
| advanced | Required | Add two-person approvals for high-risk repairs and robust rollback/compensation. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, repair notes, pii constraints, two_person_required_for, ticket_required, dryrun.required_for, dryrun.validation, entry_points, feature_flag_gate, dedupe_window, locking_strategy, rate_limits, retention, rollback methods, compensation_events, success_criteria, comms.*, post_repair report, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If idempotency_key_rule is UNKNOWN → block Completeness Gate.
- If audit.fields is UNKNOWN → block Completeness Gate.
- If verification_steps is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.ADMIN
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] approval_policy_defined == true
  - [ ] safety_checklist_defined == true
  - [ ] idempotency_concurrency_defined == true
  - [ ] audit_logging_defined == true
  - [ ] verification_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

