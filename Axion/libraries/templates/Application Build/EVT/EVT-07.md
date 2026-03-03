# EVT-07 — Event Failure Handling (DLQ, replay, backfill)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-07                                             |
| Template Type     | Build / Events                                     |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with event-driven architecture        |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, EVT-01, EVT-03, EVT-04 |
| Produces          | Filled Event Failure Handling Document              |

## 2. Purpose

Define the canonical rules for handling event delivery and processing failures, including DLQ routing, retries vs dead-lettering, replay, backfill, and operator procedures. This template must be consistent with delivery semantics and producer/consumer mapping and must not invent failure modes or recovery capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- EVT-01: `{{evt.catalog}}`
- EVT-03: `{{evt.map}}`
- EVT-04: `{{evt.delivery_semantics}}`

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Failure taxonomy                    | spec         | No              |
| Retry vs DLQ decision rules         | spec         | No              |
| DLQ model (location, routing)       | spec         | No              |
| DLQ schema (captured fields)        | spec         | No              |
| Poison message definition           | spec         | No              |
| Poison message handling rules       | spec         | No              |
| Replay policy                       | spec         | No              |
| Backfill policy                     | spec         | No              |
| Deduplication interaction           | spec         | No              |
| Retention rules                     | spec         | No              |
| Operator controls                   | spec         | No              |
| Safety controls (rate limits)       | spec         | No              |
| Audit/evidence requirements         | spec         | No              |
| Observability requirements          | spec         | No              |

## 5. Optional Fields

| Field Name                          | Source | Notes                          |
|-------------------------------------|--------|--------------------------------|
| Per-event override rules            | spec   | Event-specific overrides       |
| Partial replay rules                | spec   | Time/key range replay          |
| Reprocessing idempotency            | spec   | Guidelines for safe replay     |
| Cross-system compensation           | spec   | Saga/compensation patterns     |
| Open questions                      | agent  | Flagged unknowns               |

## 6. Rules

- Failure handling rules MUST be consistent with EVT-04 delivery semantics.
- Do not invent DLQ capability; if not defined in inputs, mark UNKNOWN and flag.
- Replay/backfill MUST be access-controlled and audited.
- Any per-event overrides MUST reference event_id from EVT-01.

## 7. Output Format

### Required Headings (in order)

1. `## Failure Taxonomy` — failure classes, transient/permanent/poison definitions
2. `## Retry vs DLQ Decision Rules` — retry allowed when, DLQ route when, max attempts
3. `## DLQ Model` — supported, location, routing rule, per-consumer/per-event DLQ
4. `## DLQ Record Schema` — captured fields (dlq_id, event_id, failure info, payload ref, trace)
5. `## Poison Message Handling` — detection rule, action, quarantine, operator notification
6. `## Replay Policy` — supported, who can replay, modes, constraints, rate limits, dedupe rule
7. `## Backfill Policy` — supported, who can backfill, sources, constraints, rate limits, dedupe rule
8. `## Retention Rules` — event retention, DLQ retention, replay window
9. `## Operator Controls` — pause/resume consumer, drain/replay/purge DLQ, audit, safety checks
10. `## Audit & Evidence` — required for, fields, evidence refs
11. `## Observability` — failure rate, retry rate, DLQ depth, replay success, alerts, dashboards
12. `## Per-Event Overrides` — event_id, override fields, notes
13. `## References` — EVT-01, EVT-03, EVT-04, EVT-05, EVT-06, EVT-08

## 8. Cross-References

- **Upstream**: EVT-01, EVT-03, EVT-04, SPEC_INDEX
- **Downstream**: EVT-08
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING, STD-AUDIT

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| UNKNOWN for DLQ/replay if undefined  | Required  | Required     | Required |
| Retry vs DLQ + DLQ schema           | Optional  | Required     | Required |
| Replay/backfill + operator + audit   | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, dlq_id_format, per_consumer_dlq, per_event_dlq, payload_ref, trace_id, request_id, dedupe_key, quarantine_location, operator_notification, who_can_replay, replay_rate_limits, who_can_backfill, backfill_rate_limits, replay_window, safety_checks, evidence_refs, alerts, dashboards, overrides, open_questions
- If dlq_supported is UNKNOWN → flag in Open Questions.
- If replay_supported == true and replay_dedupe_rule is UNKNOWN → block Completeness Gate.
- If backfill_supported == true and backfill_sources is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] failure_handling_consistent_with_evt04 == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
