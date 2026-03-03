# OFS-01 — Offline Scope & Strategy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-01                                           |
| Template Type     | Build / Offline                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring offline scope & strategy  |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Offline Scope & Strategy                  |

## 2. Purpose

Define the canonical offline scope: which features/screens work offline, which are blocked, how reads and writes behave, and what UX indicators are shown. This template must be consistent with state management offline handling and error/degraded mode UX and must not invent offline behavior not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- SMD-05: `{{smd.offline_handling}}`
- CER-03: `{{cer.offline_mode}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Offline scope statement | spec | No |
| Modes supported (full/read_only/blocked/queued) | SMD-05 | No |
| Per-feature/screen offline map | SPEC/SMD-05 | No |
| Read rules (source when offline) | SMD-05 | No |
| Write rules (queue or block) | SMD-05 | No |
| UX messaging/indicators | CER-03 | No |
| Security constraints (do not cache) | CSec-02 | No |
| Open gaps (not supported offline) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Per-role offline differences | spec | If role-based offline |
| Data size constraints | spec | Offline storage limits |
| Open questions | agent | Enrichment only |

## 6. Rules

- Must align to `{{xref:SMD-05}}` offline handling.
- Security-sensitive data MUST NOT be cached offline unless explicitly allowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Offline Scope Statement` — statement, modes_supported
2. `## Per-Feature / Screen Map` — Per entry: feature_id, screen_id, route_id, offline_mode, reads, writes, notes
3. `## Read Rules` — read_source, stale_limits
4. `## Write Rules` — queue_supported, blocked_operations
5. `## Messaging / Indicators` — banner_policy_ref, queued_indicator_policy
6. `## Security Constraints` — do_not_cache, sensitive_data_rules_ref
7. `## Open Gaps` — not_supported_offline, future_candidates

## 8. Cross-References

- **Upstream**: SMD-05, CER-03, SPEC_INDEX
- **Downstream**: OFS-02, OFS-03, OFS-04, OFS-05
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Scope statement + map entries | Required | Required | Required |
| Read/write rules + security | Optional | Required | Required |
| Per-role differences + data size | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, feature_id, screen/route ids, reads/writes notes, stale limits, blocked ops, banner/queued indicator policies, sensitive data ref, future candidates, role differences, data size constraints, open_questions
- If scope.statement is UNKNOWN → block Completeness Gate.
- If map entries are UNKNOWN → block Completeness Gate.
- If security.do_not_cache is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] offline_scope_mapped == true
- [ ] read_write_rules_defined == true
- [ ] security_constraints_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
