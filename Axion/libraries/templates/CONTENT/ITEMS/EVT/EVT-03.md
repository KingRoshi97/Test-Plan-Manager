# EVT-03 — Producer/Consumer Map (who emits/consumes, contracts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-03                                             |
| Template Type     | Build / Events                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring producer/consumer map (who emits/consumes, contracts)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Producer/Consumer Map (who emits/consumes, contracts) Document                         |

## 2. Purpose

Create the canonical mapping of who emits each event and who consumes it, including the
binding to schema contracts, delivery surface, and consumer obligations (idempotency, ordering
assumptions, error handling). This template must be consistent with EVT-01/EVT-02 and must
not invent event_ids, producer IDs, or consumer IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}}
- EVT-02 Event Schema Specs: {{evt.schemas}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Producer/consumer map index (list of mappings)
event_id (must exist in EVT-01)
schema_ref (must exist in EVT-02)
producer_id(s) (stable identifier)
consumer_id(s) (stable identifier)
surface (bus/webhook/other)
producer contract obligations (when emitted, guarantees)
consumer contract obligations (idempotency, ordering, ack)
delivery semantics assumptions per mapping (at-least-once, etc.)
partition/ordering assumptions per mapping (if applicable)
failure handling binding (what happens on consumer failure)
ownership (who owns producer + who owns consumer)
version upgrade policy (how consumers migrate)

Optional Fields
Consumer priority tier | OPTIONAL
Backfill/replay consumer behavior | OPTIONAL
Consumer filtering rules | OPTIONAL
Webhook endpoints (if surface includes webhook) | OPTIONAL
SLO expectations | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new event_ids; use only those in {{xref:EVT-01}}.
Each mapping MUST reference a valid schema_ref from {{xref:EVT-02}}.
Every consumer MUST declare idempotency behavior (dedupe key rule or UNKNOWN).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Do not restate payload fields; payload details belong to EVT-02.
If UNKNOWN appears for producer_id or consumer_id, it must be flagged in Open Questions.
Output Format
1. Map Summary
Total events mapped: {{map.total_events}}
Total producer nodes: {{map.total_producers}} | OPTIONAL
Total consumer nodes: {{map.total_consumers}} | OPTIONAL
Surfaces in use: {{map.surfaces}} | OPTIONAL
Contract versioning pointer: {{xref:EVT-02}} | OPTIONAL
2. Producer/Consumer Mapping (by event_id)
For each event_id, include the following mapping block:
Mapping
event_id: {{mappings[0].event_id}}
schema_ref: {{mappings[0].schema_ref}}
surface: {{mappings[0].surface}}
producer(s):
● producer_id: {{mappings[0].producers[0].producer_id}}
owner: {{mappings[0].producers[0].owner}} | OPTIONAL
emits_when: {{mappings[0].producers[0].emits_when}}
guarantees: {{mappings[0].producers[0].guarantees}}
partition_key: {{mappings[0].producers[0].partition_key}} | OPTIONAL
ordering_key: {{mappings[0].producers[0].ordering_key}} | OPTIONAL
consumer(s):

● consumer_id: {{mappings[0].consumers[0].consumer_id}}
owner: {{mappings[0].consumers[0].owner}} | OPTIONAL
consumes_for: {{mappings[0].consumers[0].consumes_for}}
obligations:
idempotency: {{mappings[0].consumers[0].idempotency}}
ordering: {{mappings[0].consumers[0].ordering}} | OPTIONAL
ack_mode: {{mappings[0].consumers[0].ack_mode}} | OPTIONAL
retry_behavior: {{mappings[0].consumers[0].retry_behavior}} | OPTIONAL
failure_handling_ref: {{mappings[0].consumers[0].failure_handling_ref}} (expected:
{{xref:EVT-07}}) | OPTIONAL
replay_behavior: {{mappings[0].consumers[0].replay_behavior}} | OPTIONAL
upgrade_policy: {{mappings[0].consumers[0].upgrade_policy}}
delivery_semantics: {{mappings[0].delivery_semantics}}
partitioning_assumptions: {{mappings[0].partitioning_assumptions}} | OPTIONAL
slo: {{mappings[0].slo}} | OPTIONAL
open_questions:
{{mappings[0].open_questions[0]}} | OPTIONAL
(Repeat the “Mapping” block for each event_id.)
3. References
Event catalog: {{xref:EVT-01}}
Schema specs: {{xref:EVT-02}}
Delivery semantics: {{xref:EVT-04}} | OPTIONAL
Failure handling: {{xref:EVT-07}} | OPTIONAL
Observability: {{xref:EVT-08}} | OPTIONAL
Cross-References
Upstream: {{xref:EVT-01}}, {{xref:EVT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:EVT-04}}, {{xref:EVT-07}}, {{xref:EVT-08}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for producer/consumer IDs if missing; do not invent.
intermediate: Required. Bind each mapping to schema_ref; define consumer idempotency
obligations.
advanced: Required. Add delivery semantics and upgrade policy guidance per consumer.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, owner, partition_key, ordering_key,
ack_mode, retry_behavior, failure_handling_ref, replay_behavior, consumer_priority,
filtering_rules, webhook_endpoints, slo, open_questions
If any Required Field is UNKNOWN, allow only if:

{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If event_id is UNKNOWN → block Completeness Gate.
If schema_ref is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.EVENTING
Pass conditions:
required_fields_present == true
all event_ids exist in EVT-01 (no new event_ids introduced)
all schema_refs exist in EVT-02
placeholder_resolution == true
no_unapproved_unknowns == true

EVT-04

EVT-04 — Delivery Semantics (ordering, retries, dedupe)
Header Block

## 5. Optional Fields

Consumer priority tier | OPTIONAL
Backfill/replay consumer behavior | OPTIONAL
Consumer filtering rules | OPTIONAL
Webhook endpoints (if surface includes webhook) | OPTIONAL
SLO expectations | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new event_ids; use only those in {{xref:EVT-01}}.
- Each mapping MUST reference a valid schema_ref from {{xref:EVT-02}}.
- **Every consumer MUST declare idempotency behavior (dedupe key rule or UNKNOWN).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate payload fields; payload details belong to EVT-02.
- If UNKNOWN appears for producer_id or consumer_id, it must be flagged in Open Questions.

## 7. Output Format

### Required Headings (in order)

1. `## Map Summary`
2. `## Producer/Consumer Mapping (by event_id)`
3. `## For each event_id, include the following mapping block:`
4. `## Mapping`
5. `## producer(s):`
6. `## consumer(s):`
7. `## obligations:`
8. `## open_questions:`
9. `## (Repeat the “Mapping” block for each event_id.)`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:EVT-01}}, {{xref:EVT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:EVT-04}}, {{xref:EVT-07}}, {{xref:EVT-08}} | OPTIONAL**
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
