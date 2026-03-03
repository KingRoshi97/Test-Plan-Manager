# EVT-03 — Producer/Consumer Map (who emits/consumes, contracts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-03                                             |
| Template Type     | Build / Events                                     |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with event-driven architecture        |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, EVT-01, EVT-02 |
| Produces          | Filled Producer/Consumer Map                       |

## 2. Purpose

Create the canonical mapping of who emits each event and who consumes it, including the binding to schema contracts, delivery surface, and consumer obligations (idempotency, ordering assumptions, error handling). This template must be consistent with EVT-01/EVT-02 and must not invent event_ids, producer IDs, or consumer IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- EVT-01: `{{evt.catalog}}`
- EVT-02: `{{evt.schemas}}`

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| event_id (must exist in EVT-01)     | EVT-01       | No              |
| schema_ref (must exist in EVT-02)   | EVT-02       | No              |
| producer_id(s) (stable)             | spec         | No              |
| consumer_id(s) (stable)             | spec         | No              |
| surface (bus/webhook/other)         | spec         | No              |
| producer contract obligations       | spec         | No              |
| consumer contract obligations       | spec         | No              |
| delivery semantics per mapping      | spec         | No              |
| partition/ordering assumptions      | spec         | Yes             |
| failure handling binding            | EVT-07       | No              |
| ownership (producer/consumer)       | spec         | No              |
| version upgrade policy              | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Consumer priority tier      | spec   | Only if applicable               |
| Backfill/replay behavior    | spec   | Consumer-specific replay rules   |
| Consumer filtering rules    | spec   | Event filtering at consumer      |
| Webhook endpoints           | spec   | If surface includes webhook      |
| SLO expectations            | spec   | Per-mapping SLO targets          |
| Open questions              | agent  | Flagged unknowns                 |

## 6. Rules

- Do not introduce new event_ids; use only those in EVT-01.
- Each mapping MUST reference a valid schema_ref from EVT-02.
- Every consumer MUST declare idempotency behavior (dedupe key rule or UNKNOWN).
- Do not restate payload fields; payload details belong to EVT-02.
- If UNKNOWN appears for producer_id or consumer_id, it must be flagged.

## 7. Output Format

### Required Headings (in order)

1. `## Map Summary` — total events mapped, producer nodes, consumer nodes, surfaces
2. `## Producer/Consumer Mapping` — Repeating blocks: event_id, schema_ref, surface, producer(s) with emits_when/guarantees, consumer(s) with obligations/idempotency/ordering/ack/retry/upgrade_policy, delivery_semantics, open_questions
3. `## References` — EVT-01, EVT-02, EVT-04, EVT-07, EVT-08

## 8. Cross-References

- **Upstream**: EVT-01, EVT-02, SPEC_INDEX
- **Downstream**: EVT-04, EVT-07, EVT-08
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| UNKNOWN for missing IDs             | Required  | Required     | Required |
| Schema_ref binding + idempotency     | Optional  | Required     | Required |
| Delivery semantics + upgrade policy  | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, owner, partition_key, ordering_key, ack_mode, retry_behavior, failure_handling_ref, replay_behavior, consumer_priority, filtering_rules, webhook_endpoints, slo, open_questions
- If event_id is UNKNOWN → block Completeness Gate.
- If schema_ref is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] all event_ids exist in EVT-01
- [ ] all schema_refs exist in EVT-02
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
