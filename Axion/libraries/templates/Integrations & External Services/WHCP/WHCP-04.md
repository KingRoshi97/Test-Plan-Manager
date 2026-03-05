# WHCP-04 — Delivery Semantics (ordering, replay, backoff)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-04                                             |
| Template Type     | Integration / Webhooks                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring delivery semantics (ordering, replay, backoff)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Delivery Semantics (ordering, replay, backoff) Document                         |

## 2. Purpose

Define the canonical delivery semantics for webhooks: ordering guarantees, retry/backoff
strategy, deduplication expectations, replay behavior, and acknowledgement semantics across
producers and consumers. This template must be consistent with event delivery semantics and
must not invent guarantees beyond what the system can enforce.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-02 Outbound Producer Spec: {{whcp.outbound}} | OPTIONAL
- WHCP-03 Inbound Consumer Spec: {{whcp.inbound}} | OPTIONAL
- EVT-04 Delivery Semantics (events): {{evt.delivery_semantics}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Delivery model (at-least-once / at-most-once / UNKNOWN)
Ordering guarantees (none/per-endpoint/per-key/UNKNOWN)
Deduplication expectation (consumer responsibility vs producer)
Retry schedule (attempts, backoff)
Retry stop conditions (max age/max attempts)
Handling of 429/503 (retry-after)
Replay support (yes/no)
Replay scope rules (by time/event_id)
Poison message rules (quarantine)
Telemetry requirements (attempts, latency, success rate)

Optional Fields
Per-webhook overrides | OPTIONAL
Batch delivery semantics | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
If delivery is at-least-once, consumer idempotency MUST be required.
Ordering guarantees must be explicitly scoped; do not imply global ordering.
Retry must be bounded and must not cause storms.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Delivery Model
delivery_model: {{delivery.model}} (at_least_once/at_most_once/UNKNOWN)
2. Ordering
ordering: {{ordering.model}} (none/per_endpoint/per_key/UNKNOWN)
ordering_key_rule: {{ordering.key_rule}} | OPTIONAL
3. Deduplication Expectation
dedupe_owner: {{dedupe.owner}} (producer/consumer/UNKNOWN)
idempotency_required: {{dedupe.idempotency_required}}
dedupe_key_rule: {{dedupe.key_rule}} | OPTIONAL
4. Retry Schedule
retry_supported: {{retry.supported}}
backoff_policy: {{retry.backoff_policy}}
max_attempts: {{retry.max_attempts}}
max_age_ms: {{retry.max_age_ms}} | OPTIONAL
5. Stop Conditions
stop_on: {{stop.conditions}}
quarantine_on_poison: {{stop.quarantine_on_poison}} | OPTIONAL
6. 429/503 Handling
retry_after_respected: {{r429.respected}}
fallback_delay_ms: {{r429.fallback_delay_ms}} | OPTIONAL
7. Replay
replay_supported: {{replay.supported}}
replay_scope_rules: {{replay.scope_rules}}
replay_authorization_rule: {{replay.authorization_rule}} | OPTIONAL
8. Per-Webhook Overrides (Optional)
overrides: {{overrides.list}} | OPTIONAL
9. Telemetry
delivery_attempt_metric: {{telemetry.attempt_metric}}
delivery_success_metric: {{telemetry.success_metric}} | OPTIONAL

delivery_latency_metric: {{telemetry.latency_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
10.References
Webhook catalog: {{xref:WHCP-01}}
Outbound producer: {{xref:WHCP-02}} | OPTIONAL
Inbound consumer: {{xref:WHCP-03}} | OPTIONAL
Event delivery semantics: {{xref:EVT-04}} | OPTIONAL
Failure handling: {{xref:WHCP-07}} | OPTIONAL
Cross-References
Upstream: {{xref:WHCP-02}}, {{xref:WHCP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:WHCP-07}}, {{xref:WHCP-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define delivery model, ordering model, and max attempts.
intermediate: Required. Define replay scope rules and poison/quarantine behavior and
telemetry.
advanced: Required. Add per-webhook overrides and storm-safe stop conditions and retry-after
nuances.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, ordering key rule, dedupe key rule, max
age, quarantine flag, fallback delay, replay authorization, overrides, optional telemetry
metrics/fields, batch semantics, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If delivery.model is UNKNOWN → block Completeness Gate.
If retry.max_attempts is UNKNOWN → block Completeness Gate.
If replay.supported is UNKNOWN → block Completeness Gate.
If telemetry.attempt_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
delivery_and_ordering_defined == true
bounded_retry_defined == true
replay_scope_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

WHCP-05

WHCP-05 — Security Rules (signatures, secrets rotation, allowlists)
Header Block

## 5. Optional Fields

Per-webhook overrides | OPTIONAL
Batch delivery semantics | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- If delivery is at-least-once, consumer idempotency MUST be required.
- **Ordering guarantees must be explicitly scoped; do not imply global ordering.**
- **Retry must be bounded and must not cause storms.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Delivery Model`
2. `## Ordering`
3. `## Deduplication Expectation`
4. `## Retry Schedule`
5. `## Stop Conditions`
6. `## 429/503 Handling`
7. `## Replay`
8. `## Per-Webhook Overrides (Optional)`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:WHCP-02}}, {{xref:WHCP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:WHCP-07}}, {{xref:WHCP-08}} | OPTIONAL**
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
