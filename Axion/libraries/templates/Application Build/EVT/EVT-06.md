# EVT-06 — Webhook Consumer Spec (inbound webhooks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-06                                             |
| Template Type     | Build / Events                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring webhook consumer spec (inbound webhooks)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Webhook Consumer Spec (inbound webhooks) Document                         |

## 2. Purpose

Define the canonical specification format for inbound webhooks consumed by the system,
including endpoint surface, authentication/verification, validation, idempotency/deduplication,
replay protection, rate limiting/abuse controls, mapping into internal events or jobs, and
observability. This template must be consistent with API endpoint specs and eventing delivery
semantics and must not invent inbound sources or contracts not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}} | OPTIONAL
- EVT-02 Event Schema Specs: {{evt.schemas}} | OPTIONAL
- EVT-04 Delivery Semantics: {{evt.delivery_semantics}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Inbound webhook source... | spec         | Yes             |
| Inbound endpoint mappi... | spec         | Yes             |
| Payload validation rul... | spec         | Yes             |
| Idempotency/deduplicat... | spec         | Yes             |
| Retry semantics expect... | spec         | Yes             |

## 5. Optional Fields

Batching support | OPTIONAL
Encryption requirements | OPTIONAL
Quarantine mode (store + manual review) | OPTIONAL
Per-source feature flag enablement | OPTIONAL
Dead-letter storage rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent inbound sources; source_id MUST come from inputs or be UNKNOWN.
- **Inbound webhook endpoints MUST be defined in API-01 and specified in API-02.**
- **Verification MUST be explicit; if unknown, mark UNKNOWN and flag.**
- **Idempotency MUST be deterministic if claimed (key-based).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Failure responses MUST follow: {{xref:API-03}} | OPTIONAL**
- **AuthZ for any side-effects MUST follow: {{xref:API-04}} | OPTIONAL**

## 7. Output Format

### Required Headings (in order)

1. `## Inbound Sources Summary`
2. `## Source Registry (by source_id)`
3. `## Source`
4. `## Endpoint Mapping`
5. `## Each inbound source MUST map to one or more API endpoints:`
6. `## Authentication / Verification`
7. `## Replay Protection`
8. `## Payload Validation`
9. `## Normalization / Mapping`
10. `## Idempotency / Deduplication`

## 8. Cross-References

- **Upstream: {{xref:API-01}}, {{xref:API-02}}, {{xref:EVT-04}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:EVT-07}} | OPTIONAL, {{xref:EVT-08}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
