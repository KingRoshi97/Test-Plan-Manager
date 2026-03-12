# SMD-04 — Realtime Subscription Patterns (WS hooks, reconciliation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-04                                             |
| Template Type     | Build / State Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring realtime subscription patterns (ws hooks, reconciliation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Realtime Subscription Patterns (WS hooks, reconciliation) Document                         |

## 2. Purpose

Define the canonical client realtime subscription patterns: how the client subscribes to realtime
streams (typically WebSocket), how messages are normalized into cache/store, reconciliation
rules with server truth, ordering/dedupe handling, and recovery patterns on disconnect. This
template must be consistent with event delivery semantics and WS API specs and must not
invent realtime capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-02 Query/Cache Strategy: {{smd.cache_strategy}}
- EVT-01 Event Catalog: {{evt.catalog}} | OPTIONAL
- EVT-04 Delivery Semantics: {{evt.delivery_semantics}} | OPTIONAL
- API-07 WebSocket API Spec: {{api.websocket_spec}} | OPTIONAL
- CER-02 Retry & Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Subscription model (WS topics/channels/rooms/UNKNOWN)
Subscription lifecycle (connect, auth, subscribe, unsubscribe)
Hook/pattern naming (client API surface)
Message normalization rules (to cache/store)
Reconciliation strategy (server snapshot vs stream truth)
Ordering rules (sequence numbers, timestamps)
Deduplication rules (idempotency keys)
Backfill/replay strategy on reconnect
Error handling (disconnects, auth failures)
Observability hooks (connection state, message lag)

Optional Fields
Presence/typing indicators | OPTIONAL
Client-side rate limits for subscriptions | OPTIONAL
Compression/binary frames | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Realtime patterns MUST reconcile with server truth; the stream alone must not be assumed
complete unless explicitly guaranteed.
Ordering/dedupe MUST align with {{xref:EVT-04}} semantics when applicable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Auth failures MUST bind to session expiry handling ({{xref:CER-04}}) when present.
Output Format
1. Subscription Model
model: {{rt.model}} (topics/rooms/channels/UNKNOWN)
transport: {{rt.transport}} (ws/sse/UNKNOWN)
notes: {{rt.notes}} | OPTIONAL
2. Lifecycle
connect_rule: {{lifecycle.connect_rule}}
auth_rule: {{lifecycle.auth_rule}} | OPTIONAL
subscribe_rule: {{lifecycle.subscribe_rule}}
unsubscribe_rule: {{lifecycle.unsubscribe_rule}} | OPTIONAL
reconnect_rule: {{lifecycle.reconnect_rule}} | OPTIONAL
3. Client Hook/Surface
hook_names: {{client.hooks}}
usage_rules: {{client.usage_rules}} | OPTIONAL
4. Message Normalization
message_types: {{messages.types}} | OPTIONAL
normalization_target: {{messages.normalization_target}} (cache/store/both/UNKNOWN)
apply_message_rule: {{messages.apply_rule}}
entity_key_rule: {{messages.entity_key_rule}} | OPTIONAL
5. Reconciliation Strategy
baseline_source: {{reconcile.baseline_source}} (snapshot/api_query/UNKNOWN)
when_to_snapshot: {{reconcile.when_to_snapshot}}
conflict_resolution: {{reconcile.conflict_resolution}} (LWW/version/UNKNOWN)
stale_data_policy: {{reconcile.stale_data_policy}} | OPTIONAL
6. Ordering Rules
ordering_key: {{ordering.key}} (seq/timestamp/UNKNOWN)
out_of_order_handling: {{ordering.out_of_order_handling}}
buffer_window_ms: {{ordering.buffer_window_ms}} | OPTIONAL

7. Deduplication Rules
dedupe_key_rule: {{dedupe.key_rule}}
dedupe_window: {{dedupe.window}} | OPTIONAL
8. Reconnect Backfill / Replay
backfill_supported: {{backfill.supported}}
backfill_method: {{backfill.method}} (cursor/from_seq/time_range/UNKNOWN)
backfill_request_rule: {{backfill.request_rule}} | OPTIONAL
gap_detection: {{backfill.gap_detection}} | OPTIONAL
9. Error Handling
disconnect_behavior: {{errors.disconnect_behavior}}
auth_failure_behavior: {{errors.auth_failure_behavior}} | OPTIONAL
retry_policy_ref: {{errors.retry_policy_ref}} (expected: {{xref:CER-02}}) | OPTIONAL
10.Observability Hooks
connection_state_metric: {{obs.connection_state_metric}}
message_lag_metric: {{obs.message_lag_metric}} | OPTIONAL
disconnect_count_metric: {{obs.disconnect_count_metric}} | OPTIONAL
logs_required_fields: {{obs.logs_required_fields}} | OPTIONAL
11.References
Cache strategy: {{xref:SMD-02}}
WebSocket API: {{xref:API-07}} | OPTIONAL
Event catalog: {{xref:EVT-01}} | OPTIONAL
Delivery semantics: {{xref:EVT-04}} | OPTIONAL
Retry patterns: {{xref:CER-02}} | OPTIONAL
Cross-References
Upstream: {{xref:SMD-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SMD-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for transport specifics; define lifecycle + reconciliation
skeleton.
intermediate: Required. Define ordering/dedupe + reconnect backfill strategy.
advanced: Required. Add buffering/gap detection and observability rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, auth rule, reconnect rule, hook
names, message types, entity key rule, stale data policy, buffer window, dedupe window, backfill
details, auth failure behavior, retry policy ref, message lag/disconnect metrics, logs fields,
presence/compression notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If rt.model is UNKNOWN → block Completeness Gate.
If messages.apply_rule is UNKNOWN → block Completeness Gate.
If dedupe.key_rule is UNKNOWN → block Completeness Gate.

Completeness Gate
Gate ID: TMP-05.PRIMARY.SMD
Pass conditions:
required_fields_present == true
subscription_lifecycle_defined == true
reconciliation_defined == true
ordering_and_dedupe_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SMD-05

SMD-05 — Offline State Handling (queueing, retry)
Header Block

## 5. Optional Fields

Presence/typing indicators | OPTIONAL
Client-side rate limits for subscriptions | OPTIONAL
Compression/binary frames | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Realtime patterns MUST reconcile with server truth; the stream alone must not be assumed**
- **complete unless explicitly guaranteed.**
- **Ordering/dedupe MUST align with {{xref:EVT-04}} semantics when applicable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Auth failures MUST bind to session expiry handling ({{xref:CER-04}}) when present.**

## 7. Output Format

### Required Headings (in order)

1. `## Subscription Model`
2. `## Lifecycle`
3. `## Client Hook/Surface`
4. `## Message Normalization`
5. `## Reconciliation Strategy`
6. `## Ordering Rules`
7. `## Deduplication Rules`
8. `## Reconnect Backfill / Replay`
9. `## Error Handling`
10. `## Observability Hooks`

## 8. Cross-References

- **Upstream: {{xref:SMD-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SMD-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
