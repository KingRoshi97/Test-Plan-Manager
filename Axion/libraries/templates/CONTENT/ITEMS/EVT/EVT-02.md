# EVT-02 — Event Schema Spec (payload, versioning, pii rules)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-02                                             |
| Template Type     | Build / Events                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring event schema spec (payload, versioning, pii rules)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Event Schema Spec (payload, versioning, pii rules) Document                         |

## 2. Purpose

Define the canonical schema specification format for each event payload, including:
required/optional fields, typing, versioning rules, backward/forward compatibility, and PII
handling requirements. This template must be consistent with the Event Catalog and must not
invent event_ids or payload fields not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Schema identifier (sch... | spec         | Yes             |
| Event versioning polic... | spec         | Yes             |
| Envelope fields (requi... | spec         | Yes             |
| Payload schema (fields... | spec         | Yes             |
| PII classification per... | spec         | Yes             |
| Redaction rules (logs/... | spec         | Yes             |
| Compatibility rules (b... | spec         | Yes             |
| Validation rules (requ... | spec         | Yes             |
| Serialization format (... | spec         | Yes             |
| Schema storage/registr... | spec         | Yes             |

## 5. Optional Fields

Field-level constraints (min/max/pattern) | OPTIONAL
Deprecation policy | OPTIONAL

Localization fields policy | OPTIONAL
Compression/encryption policy | OPTIONAL
Sample payloads (inline) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new event_ids; use only: {{evt.catalog.events_by_id[event_*]}} as given.
- Each EVT-02 spec MUST map to exactly one event_id and declare schema_id.
- **Envelope fields MUST be consistent across all events unless explicitly allowed otherwise.**
- **PII classification MUST follow: {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate producer/consumer mapping here; that belongs in EVT-03.
- If UNKNOWN appears in envelope fields or versioning policy, it must be flagged in Open
- **Questions.**

## 7. Output Format

### Required Headings (in order)

1. `## Schema Identity`
2. `## Versioning Policy`
3. `## Compatible changes (allowed):`
4. `## Breaking changes (require major bump):`
5. `## Event Envelope (Required Metadata)`
6. `## The following envelope fields MUST exist for all events (unless overridden):`
7. `## Payload Schema`
8. `## List payload fields (do not include envelope fields here):`
9. `## Validation Rules`
10. `## PII & Redaction`

## 8. Cross-References

- **Upstream: {{xref:EVT-01}}, {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:EVT-03}}, {{xref:EVT-04}}, {{xref:EVT-07}} | OPTIONAL**
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
