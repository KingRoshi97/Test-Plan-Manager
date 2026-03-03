# EVT-01 — Event Catalog (by event_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-01                                             |
| Template Type     | Build / Events                                     |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with event-driven architecture        |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index   |
| Produces          | Filled Event Catalog                               |

## 2. Purpose

Create the single, canonical catalog of all events emitted and/or consumed by the system, indexed by event_id. This document must be consistent with the Canonical Spec and must not invent events not present in upstream inputs. If events are missing, they must be marked UNKNOWN rather than invented.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Event catalog index                 | spec         | No              |
| event_id (stable)                   | spec         | No              |
| event_name                          | spec         | No              |
| event_version                       | spec         | No              |
| event_description                   | spec         | No              |
| producer(s)                         | spec         | No              |
| consumer(s)                         | spec         | No              |
| delivery surface                    | spec         | No              |
| reliability class                   | spec         | No              |
| ordering/partition key              | spec         | Yes             |
| PII classification                  | standards    | No              |
| schema_ref (→ EVT-02)              | EVT-02       | No              |
| triggering action(s)                | spec         | No              |
| idempotency/dedupe guidance         | spec         | No              |
| retention                           | spec         | No              |
| observability hooks                 | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Sample payload pointer      | spec   | Reference only                   |
| Backfill/replay support     | spec   | yes/no + notes                   |
| Dead-letter routing         | spec   | DLQ event_id                     |
| Security sensitivity notes  | spec   | Sensitivity classification       |
| Related feature IDs         | PRD    | Feature traceability             |
| Open questions              | agent  | Flagged unknowns                 |

## 6. Rules

- Do not introduce new event_ids; use only those from upstream inputs.
- Each event entry MUST be unique by event_id.
- Each event entry MUST reference an EVT-02 schema via schema_ref (or be marked UNKNOWN).
- PII classification MUST follow STD-PII-CLASSIFICATION.
- Do not restate full payload details here; payload fields belong in EVT-02.
- If UNKNOWN appears for producer/consumer, it must be flagged in Open Questions.

## 7. Output Format

### Required Headings (in order)

1. `## Catalog Summary` — total events, domains covered, surfaces, versioning policy pointer
2. `## Event Index` — Repeating entry blocks: event_id, event_name, event_version, description, producers, consumers, surface, reliability, ordering_key, partition_key, pii_class, schema_ref, triggering_actions, dedupe_guidance, retention, observability, sample_payload_ref, dlq_route, replay_support, related_feature_ids, open_questions
3. `## References` — EVT-02, EVT-03, EVT-04, EVT-05, EVT-06, EVT-07, EVT-08

## 8. Cross-References

- **Upstream**: SPEC_INDEX, DOMAIN_MAP, STANDARDS_INDEX
- **Downstream**: EVT-02, EVT-03, EVT-04
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING, STD-PII-CLASSIFICATION

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Fill required fields / UNKNOWN       | Required  | Required     | Required |
| Producers/consumers + schema_ref     | Optional  | Required     | Required |
| Ordering/partition + dedupe + obs    | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, ordering_key, partition_key, sample_payload_ref, dlq_route, replay_support, related_feature_ids, open_questions
- If event_id list is UNKNOWN → block Completeness Gate.
- If schema_ref is UNKNOWN for any event → allow only if flagged in Open Questions.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] all event_ids are unique
- [ ] no new event_ids introduced
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
