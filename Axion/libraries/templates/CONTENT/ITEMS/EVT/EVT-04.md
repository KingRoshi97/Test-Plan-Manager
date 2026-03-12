# EVT-04 — Delivery Semantics (ordering, retries, dedupe)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-04                                             |
| Template Type     | Build / Events                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring delivery semantics (ordering, retries, dedupe)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Delivery Semantics (ordering, retries, dedupe) Document                         |

## 2. Purpose

Define the canonical delivery semantics for the eventing system, including ordering guarantees,
retry behavior, deduplication expectations, acknowledgement modes, and consumer processing
obligations. This template must be consistent with EVT-01/02/03 and must not invent semantics
not supported by upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}}
- EVT-02 Event Schema Specs: {{evt.schemas}}
- EVT-03 Producer/Consumer Map: {{evt.map}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Delivery model statement (at-most-once / at-least-once / exactly-once / UNKNOWN)
Ack model (producer ack, broker ack, consumer ack)
Retry policy (producer side, broker side, consumer side)
Backoff strategy (fixed/exponential/jitter/UNKNOWN)
Max retry attempts / retry window
Deduplication model (where dedupe happens + key)
Idempotency requirements for consumers
Ordering guarantees (none / per partition / global / UNKNOWN)
Partitioning strategy (partition key rules)
Re-delivery behavior (when duplicates can occur)
Poison message policy binding (DLQ rules pointer)
Replay/backfill policy binding (if supported)
Failure classification (transient vs permanent) and handling
Observability requirements for delivery (lag, retry count, dupes)

Optional Fields
Transactional outbox pattern rules | OPTIONAL
Exactly-once constraints/requirements | OPTIONAL
Consumer concurrency limits | OPTIONAL
Cross-region delivery notes | OPTIONAL
Schema evolution interaction notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Semantics defined here MUST be referenced by EVT-03 mappings (or marked UNKNOWN).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Deduplication MUST be deterministic (key-based) if claimed.
If ordering is claimed, partition key rules MUST be specified (or UNKNOWN flagged).
If DLQ is supported, failure routing MUST reference EVT-07 (or be UNKNOWN flagged).
Output Format
1. Delivery Model
delivery_mode: {{delivery.mode}} (at_most_once / at_least_once / exactly_once /
UNKNOWN)
notes: {{delivery.notes}} | OPTIONAL
2. Acknowledgement Model
producer_ack: {{ack.producer_ack}}
broker_ack: {{ack.broker_ack}} | OPTIONAL
consumer_ack: {{ack.consumer_ack}}
ack_timeout_ms: {{ack.timeout_ms}} | OPTIONAL
3. Retry Policy
producer_retry: {{retry.producer}} | OPTIONAL
broker_retry: {{retry.broker}} | OPTIONAL
consumer_retry: {{retry.consumer}}
backoff_strategy: {{retry.backoff_strategy}}
max_attempts: {{retry.max_attempts}}
retry_window: {{retry.window}} | OPTIONAL
retryable_error_classes: {{retry.retryable_error_classes}} | OPTIONAL
non_retryable_error_classes: {{retry.non_retryable_error_classes}} | OPTIONAL
4. Deduplication & Idempotency
dedupe_location: {{dedupe.location}} (consumer / broker / producer / UNKNOWN)
dedupe_key: {{dedupe.key}} (event_id + key fields / idempotency_key / UNKNOWN)
dedupe_window: {{dedupe.window}} | OPTIONAL
consumer_idempotency_required: {{dedupe.consumer_idempotency_required}}
idempotency_guidance: {{dedupe.guidance}}
5. Ordering & Partitioning
ordering_guarantee: {{ordering.guarantee}} (none / per_partition / global / UNKNOWN)

partition_key_rule: {{ordering.partition_key_rule}}
tie_break_rule: {{ordering.tie_break_rule}} | OPTIONAL
out_of_order_handling: {{ordering.out_of_order_handling}} | OPTIONAL
6. Redelivery & Duplicate Expectations
when_duplicates_occur: {{redelivery.when_duplicates_occur}}
consumer_duplicate_handling: {{redelivery.consumer_handling}}
poison_message_definition: {{redelivery.poison_definition}} | OPTIONAL
7. Failure Handling Bindings
dlq_supported: {{failure.dlq_supported}}
dlq_policy_ref: {{failure.dlq_policy_ref}} (expected: {{xref:EVT-07}}) | OPTIONAL
replay_supported: {{failure.replay_supported}} | OPTIONAL
replay_policy_ref: {{failure.replay_policy_ref}} | OPTIONAL
failure_classification:
transient: {{failure.classification.transient}}
permanent: {{failure.classification.permanent}}
8. Observability Requirements
Lag metrics: {{obs.lag_metrics}}
Retry metrics: {{obs.retry_metrics}}
DLQ metrics: {{obs.dlq_metrics}} | OPTIONAL
Duplicate metrics: {{obs.duplicate_metrics}} | OPTIONAL
Tracing requirements: {{obs.tracing}} | OPTIONAL
Alert thresholds: {{obs.alerts}} | OPTIONAL
9. References
Event catalog: {{xref:EVT-01}}
Schema specs: {{xref:EVT-02}}
Producer/consumer map: {{xref:EVT-03}}
Failure handling: {{xref:EVT-07}} | OPTIONAL
Observability: {{xref:EVT-08}} | OPTIONAL
Cross-References
Upstream: {{xref:EVT-01}}, {{xref:EVT-02}}, {{xref:EVT-03}}
Downstream: {{xref:EVT-07}}, {{xref:EVT-08}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN where semantics are not defined by inputs; do not invent
guarantees.
intermediate: Required. Define retry/dedupe/order rules that match the platform’s actual
capabilities.
advanced: Required. Add crisp failure classification and observability/alerting requirements.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, producer_retry, broker_retry,
retry_window, retryable_error_classes, non_retryable_error_classes, dedupe_window,

tie_break_rule, out_of_order_handling, poison_message_definition, dlq_policy_ref,
replay_supported, replay_policy_ref, tracing, alerts, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If delivery_mode is UNKNOWN → allow only if flagged as Open Question.
If ordering_guarantee is claimed but partition_key_rule is UNKNOWN → block Completeness
Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.EVENTING
Pass conditions:
required_fields_present == true
semantics_consistent_with_evt03 == true
placeholder_resolution == true
no_unapproved_unknowns == true

EVT-05

EVT-05 — Webhook Producer Spec (outbound webhooks)
Header Block

## 5. Optional Fields

Transactional outbox pattern rules | OPTIONAL
Exactly-once constraints/requirements | OPTIONAL
Consumer concurrency limits | OPTIONAL
Cross-region delivery notes | OPTIONAL
Schema evolution interaction notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Semantics defined here MUST be referenced by EVT-03 mappings (or marked UNKNOWN).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Deduplication MUST be deterministic (key-based) if claimed.**
- If ordering is claimed, partition key rules MUST be specified (or UNKNOWN flagged).
- If DLQ is supported, failure routing MUST reference EVT-07 (or be UNKNOWN flagged).

## 7. Output Format

### Required Headings (in order)

1. `## Delivery Model`
2. `## UNKNOWN)`
3. `## Acknowledgement Model`
4. `## Retry Policy`
5. `## Deduplication & Idempotency`
6. `## Ordering & Partitioning`
7. `## Redelivery & Duplicate Expectations`
8. `## Failure Handling Bindings`
9. `## failure_classification:`
10. `## Observability Requirements`

## 8. Cross-References

- **Upstream: {{xref:EVT-01}}, {{xref:EVT-02}}, {{xref:EVT-03}}**
- **Downstream: {{xref:EVT-07}}, {{xref:EVT-08}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
