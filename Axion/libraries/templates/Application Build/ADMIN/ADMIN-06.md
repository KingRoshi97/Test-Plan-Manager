# ADMIN-06 — Admin Observability & Safeguards

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-06                                         |
| Template Type     | Build / Admin                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring admin observability & saf |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Admin Observability & Safeguards          |

## 2. Purpose

Define the canonical safeguards and observability requirements for admin/internal tools and privileged API usage, including confirmations/approvals, rate limiting, anomaly detection, auditing integrity, dashboards, and alerts. This template must be consistent with admin capabilities and audit trail specs and must not invent safeguards not supported by upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ADMIN-01 Admin Capabilities Matrix: {{admin.capabilities}}
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}}
- ADMIN-05 Privileged API Surface Catalog: {{admin.privileged_api_catalog}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- RLIM-02 Rate Limit Catalog: {{rlim.catalog}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Safeguard policy statement | spec | No |
| Confirmation patterns | spec | Yes |
| Approval patterns | spec | Yes |
| Break-glass controls | spec | Yes |
| Rate limit policy for admin surfaces | RLIM | Yes |
| Anomaly detection signals | spec | Yes |
| Audit integrity checks | ADMIN-03 | Yes |
| Dashboard requirements | spec | No |
| Alert requirements | spec | No |
| Runbook/procedure references | ops | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Per-capability safeguard overrides | spec | OPTIONAL |
| Geo/IP restrictions | spec | OPTIONAL |
| Device posture requirements | spec | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- High-risk/critical capabilities MUST have stronger safeguards (or UNKNOWN flagged).
- Admin surfaces MUST be rate-limited unless explicitly exempted.
- Audit write failures MUST alert.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Safeguards MUST be consistent with AuthZ ({{xref:API-04}}) and audit policy ({{xref:ADMIN-03}}).

## 7. Cross-References

- **Upstream**: {{xref:ADMIN-01}}, {{xref:ADMIN-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:RUNBOOK-ADMIN}} | OPTIONAL, {{xref:OPS-OBS}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}} | OPTIONAL, {{standards.rules[STD-SECURITY]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | Define baseline safeguards and core alerts; use UNKNOWN for anomaly tooling. |
| intermediate | Required | Bind safeguards to risk classes and define admin rate-limit linkage. |
| advanced | Required | Add audit integrity verification and per-capability overrides. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, policy defaults by risk, typed confirm, cooldown, ticket requirements, approval_required_for, breakglass time bounds/max duration, postmortem_required, ratelimit refs, anomaly signals, anomaly rules ref, integrity verification, dashboards optional, alerts routing/runbook, overrides, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If policy.statement is UNKNOWN → block Completeness Gate.
- If alerts.audit_write_failures is UNKNOWN → block Completeness Gate.
- If minimum_panels is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.ADMIN
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] safeguards_defined == true
  - [ ] admin_rate_limit_linkage_defined == true
  - [ ] dashboard_minimum_defined == true
  - [ ] alert_set_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

