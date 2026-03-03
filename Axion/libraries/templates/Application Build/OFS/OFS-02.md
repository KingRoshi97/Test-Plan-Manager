# OFS-02 — Local Storage Schema

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-02                                           |
| Template Type     | Build / Offline                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring local storage schema      |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Local Storage Schema                      |

## 2. Purpose

Define the canonical offline sync model: how queued ops are stored and drained, ordering guarantees, conflict detection/resolution, and reconciliation between local state and server truth. This template must be consistent with offline queue and mutation patterns and must not invent sync semantics not present in upstream inputs.

## 3. Inputs Required

- OFS-01: `{{ofs.scope}}`
- SMD-05: `{{smd.offline_handling}}`
- SMD-03: `{{smd.mutation_patterns}}` | OPTIONAL
- EVT-04: `{{evt.delivery_semantics}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Queue drain strategy (when and how) | SMD-05 | No |
| Ordering guarantees (FIFO per entity, etc.) | SMD-05 | No |
| Batching policy (if any) | spec | Yes |
| Conflict detection rules (version, etag) | spec | No |
| Conflict resolution policy (LWW/merge/prompt) | spec | No |
| Retry/backoff policy for sync | CER-02 | No |
| Partial failure handling (some ops fail) | spec | No |
| Reconciliation strategy after drain | spec | No |
| Telemetry requirements | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Priority lanes (high/low) | spec | If priority ordering needed |
| Background sync constraints | MBAT-01 | OS background limits |
| Open questions | agent | Enrichment only |

## 6. Rules

- Sync must preserve user intent and not silently drop ops.
- Conflict policy MUST be explicit and deterministic.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Queue Drain` — drain_trigger, drain_order, batching_enabled, max_batch_size
2. `## Ordering Guarantees` — ordering_model, dedupe_rule
3. `## Conflict Detection` — version_field_rule, etag_rule
4. `## Conflict Resolution` — policy, user_prompt_rule, merge_rules
5. `## Retry / Backoff` — backoff_policy, max_attempts, retryable_errors
6. `## Partial Failure Handling` — on_partial_failure, poison_message_rule
7. `## Reconciliation After Drain` — refresh_rule, queries_to_refetch
8. `## Telemetry` — drain_success_metric, drain_failure_metric, conflict_metric, fields

## 8. Cross-References

- **Upstream**: OFS-01, SMD-05, SPEC_INDEX
- **Downstream**: OFS-03, OFS-04, OFS-05
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Drain trigger + ordering model | Required | Required | Required |
| Conflict policy + retry/backoff | Optional | Required | Required |
| Poison/partial failure + bg constraints | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, batching/max batch size, dedupe rule, etag rule, user prompt/merge rules, max attempts/retryable errors, poison message rule, queries to refetch, telemetry fields, priority lanes, background constraints, open_questions
- If drain.order is UNKNOWN → block Completeness Gate.
- If conflict.version_field_rule is UNKNOWN → block Completeness Gate.
- If retry.backoff_policy is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] drain_and_ordering_defined == true
- [ ] conflict_policy_defined == true
- [ ] retry_backoff_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
