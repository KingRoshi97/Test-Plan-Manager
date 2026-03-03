# EVT-04 — Delivery Semantics (ordering, retries, dedupe)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-04                                             |
| Template Type     | Build / Events                                     |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with event-driven architecture        |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, EVT-01, EVT-02, EVT-03 |
| Produces          | Filled Delivery Semantics Document                 |

## 2. Purpose

Define the canonical delivery semantics for the eventing system, including ordering guarantees, retry behavior, deduplication expectations, acknowledgement modes, and consumer processing obligations. This template must be consistent with EVT-01/02/03 and must not invent semantics not supported by upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- EVT-01: `{{evt.catalog}}`
- EVT-02: `{{evt.schemas}}`
- EVT-03: `{{evt.map}}`

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Delivery model statement            | spec         | No              |
| Ack model (producer/broker/consumer)| spec         | No              |
| Retry policy (producer/broker/consumer)| spec      | No              |
| Backoff strategy                    | spec         | No              |
| Max retry attempts / window         | spec         | No              |
| Deduplication model                 | spec         | No              |
| Idempotency requirements            | spec         | No              |
| Ordering guarantees                 | spec         | No              |
| Partitioning strategy               | spec         | No              |
| Re-delivery behavior                | spec         | No              |
| Poison message policy binding       | EVT-07       | No              |
| Replay/backfill policy binding      | spec         | Yes             |
| Failure classification              | spec         | No              |
| Observability requirements          | spec         | No              |

## 5. Optional Fields

| Field Name                          | Source | Notes                          |
|-------------------------------------|--------|--------------------------------|
| Transactional outbox pattern rules  | spec   | Only if applicable             |
| Exactly-once constraints            | spec   | Must be proven                 |
| Consumer concurrency limits         | spec   | Only if applicable             |
| Cross-region delivery notes         | spec   | Multi-region only              |
| Schema evolution interaction        | spec   | Compatibility notes            |
| Open questions                      | agent  | Flagged unknowns               |

## 6. Rules

- Semantics defined here MUST be referenced by EVT-03 mappings.
- Deduplication MUST be deterministic (key-based) if claimed.
- If ordering is claimed, partition key rules MUST be specified.
- If DLQ is supported, failure routing MUST reference EVT-07.

## 7. Output Format

### Required Headings (in order)

1. `## Delivery Model` — delivery mode, notes
2. `## Acknowledgement Model` — producer_ack, broker_ack, consumer_ack, timeout
3. `## Retry Policy` — producer/broker/consumer retry, backoff, max attempts, retryable/non-retryable classes
4. `## Deduplication & Idempotency` — dedupe location, key, window, consumer idempotency
5. `## Ordering & Partitioning` — ordering guarantee, partition key rule, tie-break, out-of-order handling
6. `## Redelivery & Duplicate Expectations` — when duplicates occur, consumer handling, poison definition
7. `## Failure Handling Bindings` — DLQ supported, policy ref, replay supported, failure classification
8. `## Observability Requirements` — lag, retry, DLQ, duplicate, tracing metrics, alerts
9. `## References` — EVT-01, EVT-02, EVT-03, EVT-07, EVT-08

## 8. Cross-References

- **Upstream**: EVT-01, EVT-02, EVT-03
- **Downstream**: EVT-07, EVT-08
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| UNKNOWN where not defined            | Required  | Required     | Required |
| Retry/dedupe/order rules             | Optional  | Required     | Required |
| Failure classification + observ.     | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, producer_retry, broker_retry, retry_window, retryable_error_classes, non_retryable_error_classes, dedupe_window, tie_break_rule, out_of_order_handling, poison_message_definition, dlq_policy_ref, replay_supported, replay_policy_ref, tracing, alerts, open_questions
- If delivery_mode is UNKNOWN → allow only if flagged as Open Question.
- If ordering_guarantee is claimed but partition_key_rule is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] semantics_consistent_with_evt03 == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
