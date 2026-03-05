# EVT-07 — Event Failure Handling (DLQ, replay, backfill)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-07                                             |
| Template Type     | Build / Events                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring event failure handling (dlq, replay, backfill)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Event Failure Handling (DLQ, replay, backfill) Document                         |

## 2. Purpose

Define the canonical rules for handling event delivery and processing failures, including DLQ
routing, retries vs dead-lettering, replay, backfill, and operator procedures. This template must
be consistent with delivery semantics and producer/consumer mapping and must not invent
failure modes or recovery capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}}
- EVT-03 Producer/Consumer Map: {{evt.map}}
- EVT-04 Delivery Semantics: {{evt.delivery_semantics}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Failure taxonomy (classes of failure)
Retry vs DLQ decision rules
DLQ model (where stored, how routed, identifiers)
DLQ schema (what fields captured)
Poison message definition and handling rules
Replay policy (who can replay, how, constraints)
Backfill policy (who can backfill, how, constraints)
Deduplication interaction (replay duplicates rules)
Retention rules (event retention, DLQ retention)
Operator controls (pause consumer, drain, replay, purge)
Safety controls (rate limits on replay/backfill)
Audit/evidence requirements for operator actions
Observability requirements (DLQ depth, replay success, failure rates)

Optional Fields
Per-event override rules | OPTIONAL
Partial replay rules (time range, key range) | OPTIONAL
Reprocessing idempotency guidelines | OPTIONAL
Cross-system compensation patterns | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Failure handling rules MUST be consistent with {{xref:EVT-04}} delivery semantics.
Do not invent DLQ capability; if DLQ is not defined in inputs, mark UNKNOWN and flag.
Replay/backfill MUST be access-controlled and audited (or UNKNOWN flagged).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Any per-event overrides MUST be declared explicitly and reference event_id from
{{xref:EVT-01}}.
Output Format
1. Failure Taxonomy
Failure classes:
{{failure.classes[0]}}
{{failure.classes[1]}}
{{failure.classes[2]}}
Transient definition: {{failure.transient_definition}}
Permanent definition: {{failure.permanent_definition}}
Poison definition: {{failure.poison_definition}}
2. Retry vs DLQ Decision Rules
retry_allowed_when: {{decision.retry_allowed_when}}
dlq_route_when: {{decision.dlq_route_when}}
max_attempts_policy: {{decision.max_attempts_policy}}
non_retryable_conditions: {{decision.non_retryable_conditions}} | OPTIONAL
3. DLQ Model
dlq_supported: {{dlq.supported}}
dlq_location: {{dlq.location}} (queue/topic/table/UNKNOWN)
dlq_id_format: {{dlq.id_format}} | OPTIONAL
routing_rule: {{dlq.routing_rule}}
per_consumer_dlq: {{dlq.per_consumer}} | OPTIONAL
per_event_dlq: {{dlq.per_event}} | OPTIONAL
4. DLQ Record Schema (Captured Fields)
Required fields captured for each DLQ record:
dlq_id: {{dlq_record.dlq_id}}
event_id: {{dlq_record.event_id}}
event_version: {{dlq_record.event_version}} | OPTIONAL
producer: {{dlq_record.producer}} | OPTIONAL

consumer: {{dlq_record.consumer}} | OPTIONAL
failed_at: {{dlq_record.failed_at}}
failure_class: {{dlq_record.failure_class}}
failure_reason: {{dlq_record.failure_reason}}
attempt_count: {{dlq_record.attempt_count}}
payload_ref: {{dlq_record.payload_ref}} | OPTIONAL
trace_id: {{dlq_record.trace_id}} | OPTIONAL
request_id: {{dlq_record.request_id}} | OPTIONAL
dedupe_key: {{dlq_record.dedupe_key}} | OPTIONAL
5. Poison Message Handling
poison_detection_rule: {{poison.detection_rule}}
poison_action: {{poison.action}} (dlq/skip/quarantine/UNKNOWN)
quarantine_location: {{poison.quarantine_location}} | OPTIONAL
operator_notification: {{poison.operator_notification}} | OPTIONAL
6. Replay Policy
replay_supported: {{replay.supported}}
who_can_replay: {{replay.who_can_replay}} (bind to {{xref:API-04}}) | OPTIONAL
replay_modes: {{replay.modes}} (single/dlq_batch/time_range/key_range/UNKNOWN)
replay_constraints: {{replay.constraints}}
replay_rate_limits: {{replay.rate_limits}} | OPTIONAL
replay_dedupe_rule: {{replay.dedupe_rule}}
7. Backfill Policy
backfill_supported: {{backfill.supported}}
who_can_backfill: {{backfill.who_can_backfill}} | OPTIONAL
backfill_sources: {{backfill.sources}} (events_store/snapshots/external/UNKNOWN)
backfill_constraints: {{backfill.constraints}}
backfill_rate_limits: {{backfill.rate_limits}} | OPTIONAL
backfill_dedupe_rule: {{backfill.dedupe_rule}}
8. Retention Rules
event_retention: {{retention.events}}
dlq_retention: {{retention.dlq}}
replay_window: {{retention.replay_window}} | OPTIONAL
9. Operator Controls & Procedures
controls:
pause_consumer: {{ops.pause_consumer}}
resume_consumer: {{ops.resume_consumer}}
drain_dlq: {{ops.drain_dlq}} | OPTIONAL
replay_dlq: {{ops.replay_dlq}} | OPTIONAL
purge_dlq: {{ops.purge_dlq}} | OPTIONAL
required_audit: {{ops.required_audit}}
safety_checks: {{ops.safety_checks}} | OPTIONAL
10.Audit & Evidence
audit_required_for: {{audit.required_for}}

audit_fields: {{audit.fields}}
evidence_refs: {{audit.evidence_refs}} | OPTIONAL
11.Observability Requirements
metrics:
failure_rate: {{obs.metrics.failure_rate}}
retry_rate: {{obs.metrics.retry_rate}} | OPTIONAL
dlq_depth: {{obs.metrics.dlq_depth}} | OPTIONAL
replay_success: {{obs.metrics.replay_success}} | OPTIONAL
backfill_success: {{obs.metrics.backfill_success}} | OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
dashboards: {{obs.dashboards}} | OPTIONAL
12.Per-Event Overrides (Optional)
override
event_id: {{overrides[0].event_id}}
override_fields: {{overrides[0].override_fields}}
notes: {{overrides[0].notes}} | OPTIONAL
13.References
Event catalog: {{xref:EVT-01}}
Producer/consumer map: {{xref:EVT-03}}
Delivery semantics: {{xref:EVT-04}}
Webhook producer: {{xref:EVT-05}} | OPTIONAL
Webhook consumer: {{xref:EVT-06}} | OPTIONAL
Observability: {{xref:EVT-08}} | OPTIONAL
Cross-References
Upstream: {{xref:EVT-01}}, {{xref:EVT-03}}, {{xref:EVT-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:EVT-08}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
| OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for DLQ/replay/backfill if not defined; do not invent
capabilities.
intermediate: Required. Define retry vs DLQ rules and captured DLQ schema fields.
advanced: Required. Add replay/backfill constraints, operator controls, audit + observability
rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, dlq_id_format, per_consumer_dlq,
per_event_dlq, payload_ref, trace_id, request_id, dedupe_key, quarantine_location,
operator_notification, who_can_replay, replay_rate_limits, who_can_backfill, backfill_rate_limits,
replay_window, safety_checks, evidence_refs, alerts, dashboards, overrides, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

If dlq_supported is UNKNOWN → flag in Open Questions.
If replay_supported == true and replay_dedupe_rule is UNKNOWN → block Completeness
Gate.
If backfill_supported == true and backfill_sources is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.EVENTING
Pass conditions:
required_fields_present == true
failure_handling_consistent_with_evt04 == true
placeholder_resolution == true
no_unapproved_unknowns == true

EVT-08

EVT-08 — Event Observability (lag, success rate, tracing)
Header Block

## 5. Optional Fields

Per-event override rules | OPTIONAL
Partial replay rules (time range, key range) | OPTIONAL
Reprocessing idempotency guidelines | OPTIONAL
Cross-system compensation patterns | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Failure handling rules MUST be consistent with {{xref:EVT-04}} delivery semantics.**
- Do not invent DLQ capability; if DLQ is not defined in inputs, mark UNKNOWN and flag.
- **Replay/backfill MUST be access-controlled and audited (or UNKNOWN flagged).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Any per-event overrides MUST be declared explicitly and reference event_id from**
- **{{xref:EVT-01}}.**

## 7. Output Format

### Required Headings (in order)

1. `## Failure Taxonomy`
2. `## Failure classes:`
3. `## Retry vs DLQ Decision Rules`
4. `## DLQ Model`
5. `## DLQ Record Schema (Captured Fields)`
6. `## Required fields captured for each DLQ record:`
7. `## Poison Message Handling`
8. `## Replay Policy`
9. `## Backfill Policy`
10. `## Retention Rules`

## 8. Cross-References

- **Upstream: {{xref:EVT-01}}, {{xref:EVT-03}}, {{xref:EVT-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:EVT-08}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
- | OPTIONAL

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
