# EVT-01 — Event Catalog (by event_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-01                                             |
| Template Type     | Build / Events                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring event catalog (by event_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Event Catalog (by event_id) Document                         |

## 2. Purpose

Create the single, canonical catalog of all events emitted and/or consumed by the system,
indexed by event_id. This document must be consistent with the Canonical Spec and must not
invent events not present in upstream inputs. If events are missing, they must be marked
UNKNOWN rather than invented.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Event catalog index (list of event entries)
event_id (stable identifier)
event_name (human-readable)
event_version (semver or integer policy)
event_description (one paragraph)
producer(s) (service/module/domain)
consumer(s) (service/module/domain)
delivery surface (internal bus / webhook / ws / other)
reliability class (best-effort / at-least-once / exactly-once | if supported)
ordering key / partition key (if applicable)
PII classification (none / low / medium / high)
schema_ref (pointer to EVT-02 schema spec)
triggering action(s) (what causes the event)
idempotency/dedupe guidance (consumer expectations)
retention (how long stored/replayable)
observability hooks (metrics names / trace attributes)

Optional Fields
Sample payload pointer | OPTIONAL
Backfill/replay support (yes/no + notes) | OPTIONAL
Dead-letter routing (dlq event_id) | OPTIONAL
Security sensitivity notes | OPTIONAL
Related feature IDs | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new event_ids. Use only: {{spec.events_by_id[event_*]}} as given.
Each event entry MUST be unique by event_id.
Each event entry MUST reference an EVT-02 schema via schema_ref (or be marked
UNKNOWN).
PII classification MUST follow: {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Do not restate full payload details here; payload fields belong in EVT-02.
If UNKNOWN appears for producer/consumer, it must be flagged in “Open Questions.”
Output Format
1. Catalog Summary
Total events: {{evt.catalog.total}}
Domains covered: {{evt.catalog.domains}} | OPTIONAL
Surfaces: {{evt.catalog.surfaces}} | OPTIONAL
Versioning policy pointer: {{xref:EVT-02}} | OPTIONAL
2. Event Index (by event_id)
For each event, include the following entry block:
Event
event_id: {{events[0].event_id}}
event_name: {{events[0].event_name}}
event_version: {{events[0].event_version}}
description: {{events[0].description}}
producer(s): {{events[0].producers}}
consumer(s): {{events[0].consumers}}
surface: {{events[0].surface}}
reliability: {{events[0].reliability}}
ordering_key: {{events[0].ordering_key}} | OPTIONAL
partition_key: {{events[0].partition_key}} | OPTIONAL
pii_class: {{events[0].pii_class}}
schema_ref: {{events[0].schema_ref}} (expected: {{xref:EVT-02}})
triggering_actions: {{events[0].triggering_actions}}
dedupe_guidance: {{events[0].dedupe_guidance}}

retention: {{events[0].retention}}
observability:
metrics: {{events[0].observability.metrics}}
trace_attrs: {{events[0].observability.trace_attrs}} | OPTIONAL
sample_payload_ref: {{events[0].sample_payload_ref}} | OPTIONAL
dlq_route: {{events[0].dlq_route}} | OPTIONAL
replay_support: {{events[0].replay_support}} | OPTIONAL
related_feature_ids: {{events[0].related_feature_ids}} | OPTIONAL
open_questions:
{{events[0].open_questions[0]}} | OPTIONAL
(Repeat the “Event” entry block for each event_id in the system.)
3. References
Event schema specs: {{xref:EVT-02}}
Producer/consumer map: {{xref:EVT-03}} | OPTIONAL
Delivery semantics: {{xref:EVT-04}} | OPTIONAL
Webhook specs: {{xref:EVT-05}}, {{xref:EVT-06}} | OPTIONAL
Failure handling: {{xref:EVT-07}} | OPTIONAL
Observability: {{xref:EVT-08}} | OPTIONAL
Cross-References
Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:DOMAIN_MAP}} | OPTIONAL,
{{xref:STANDARDS_INDEX}} | OPTIONAL
Downstream: {{xref:EVT-02}}, {{xref:EVT-03}}, {{xref:EVT-04}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Fill required fields with UNKNOWN where needed; do not invent event_ids.
intermediate: Required. Populate producers/consumers/surfaces from inputs; ensure
schema_ref points to EVT-02.
advanced: Required. Add ordering/partition keys, dedupe and retention guidance, and
observability hooks.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, ordering_key, partition_key,
sample_payload_ref, dlq_route, replay_support, related_feature_ids, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If event_id list is UNKNOWN → block Completeness Gate.
If schema_ref is UNKNOWN for any event → allow only if flagged in Open Questions.

Completeness Gate
Gate ID: TMP-05.PRIMARY.EVENTING
Pass conditions:
required_fields_present == true
all event_ids are unique (no duplicates)
no new event_ids introduced (only references to existing IDs)
placeholder_resolution == true
no_unapproved_unknowns == true

EVT-02

EVT-02 — Event Schema Spec (payload, versioning, pii rules)
Header Block

## 5. Optional Fields

Sample payload pointer | OPTIONAL
Backfill/replay support (yes/no + notes) | OPTIONAL
Dead-letter routing (dlq event_id) | OPTIONAL
Security sensitivity notes | OPTIONAL
Related feature IDs | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new event_ids. Use only: {{spec.events_by_id[event_*]}} as given.
- Each event entry MUST be unique by event_id.
- Each event entry MUST reference an EVT-02 schema via schema_ref (or be marked
- **UNKNOWN).**
- **PII classification MUST follow: {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate full payload details here; payload fields belong in EVT-02.
- If UNKNOWN appears for producer/consumer, it must be flagged in “Open Questions.”

## 7. Output Format

### Required Headings (in order)

1. `## Catalog Summary`
2. `## Event Index (by event_id)`
3. `## For each event, include the following entry block:`
4. `## Event`
5. `## observability:`
6. `## open_questions:`
7. `## (Repeat the “Event” entry block for each event_id in the system.)`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:DOMAIN_MAP}} | OPTIONAL,**
- **{{xref:STANDARDS_INDEX}} | OPTIONAL**
- **Downstream: {{xref:EVT-02}}, {{xref:EVT-03}}, {{xref:EVT-04}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL

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
