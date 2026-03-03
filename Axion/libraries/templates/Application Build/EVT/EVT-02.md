# EVT-02 — Event Schema Spec (payload, versioning, pii rules)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-02                                             |
| Template Type     | Build / Events                                     |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with event-driven architecture        |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, EVT-01 |
| Produces          | Filled Event Schema Spec                           |

## 2. Purpose

Define the canonical schema specification format for each event payload, including: required/optional fields, typing, versioning rules, backward/forward compatibility, and PII handling requirements. This template must be consistent with the Event Catalog and must not invent event_ids or payload fields not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- EVT-01: `{{evt.catalog}}`

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Schema identifier (schema_id)       | spec         | No              |
| Binding to event_id                 | EVT-01       | No              |
| Event versioning policy             | spec         | No              |
| Envelope fields                     | spec         | No              |
| Payload schema (fields/types)       | spec         | No              |
| PII classification per field        | standards    | No              |
| Redaction rules (logs/traces)       | standards    | No              |
| Compatibility rules                 | spec         | No              |
| Validation rules                    | spec         | No              |
| Serialization format                | spec         | No              |
| Schema storage/registry location    | spec         | No              |
| Change control rules                | spec         | No              |
| Test vectors (valid + invalid)      | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Field-level constraints     | spec   | min/max/pattern                  |
| Deprecation policy          | spec   | Schema sunset rules              |
| Localization fields policy  | spec   | i18n handling                    |
| Compression/encryption      | spec   | Transport-level                  |
| Sample payloads (inline)    | spec   | Examples only                    |
| Open questions              | agent  | Flagged unknowns                 |

## 6. Rules

- Do not introduce new event_ids; use only those from EVT-01.
- Each EVT-02 spec MUST map to exactly one event_id and declare schema_id.
- Envelope fields MUST be consistent across all events unless explicitly allowed.
- PII classification MUST follow STD-PII-CLASSIFICATION.
- Do not restate producer/consumer mapping here; that belongs in EVT-03.
- If UNKNOWN appears in envelope fields or versioning policy, it must be flagged.

## 7. Output Format

### Required Headings (in order)

1. `## Schema Identity` — event_id, schema_id, event_version, serialization, registry_location
2. `## Versioning Policy` — versioning model, compatible changes, breaking changes, deprecation
3. `## Event Envelope` — required metadata fields (event_id, event_version, event_ts, producer, trace_id, etc.)
4. `## Payload Schema` — fields list: name, type, required, pii_class
5. `## Validation Rules` — required fields, enums, formats, constraints
6. `## PII & Redaction` — policy pointer, field redaction rules, encryption
7. `## Compatibility & Migration` — backward/forward rules, migration guidance
8. `## Change Control` — owners, approvals, publishing steps, rollout
9. `## Test Vectors` — valid example ref, invalid example ref, contract tests
10. `## References` — EVT-01, EVT-03, EVT-04, EVT-07

## 8. Cross-References

- **Upstream**: EVT-01, SPEC_INDEX, STANDARDS_INDEX
- **Downstream**: EVT-03, EVT-04, EVT-07
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING, STD-PII-CLASSIFICATION

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| UNKNOWN where inputs missing         | Required  | Required     | Required |
| Envelope + payload + validation      | Optional  | Required     | Required |
| Compatibility + migration + tests    | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, owner, trace_id, request_id, idempotency_key, tenant, schema_ref, constraints, enums, formats, deprecation_window, encryption_required, migration_guidance, approvals, publish_steps, rollout_policy, contract_tests_required
- If payload schema is UNKNOWN → block Completeness Gate.
- If PII classification policy is UNKNOWN → block Completeness Gate unless explicitly allowed.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] schema_id maps to existing event_id from EVT-01
- [ ] envelope_fields_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
