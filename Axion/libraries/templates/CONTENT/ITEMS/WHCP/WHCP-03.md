# WHCP-03 — Inbound Webhook Consumer Spec (verification, idempotency)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-03                                             |
| Template Type     | Integration / Webhooks                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring inbound webhook consumer spec (verification, idempotency)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Inbound Webhook Consumer Spec (verification, idempotency) Document                         |

## 2. Purpose

Define the canonical inbound webhook consumer behavior: endpoint contract, signature
verification, allowlists, idempotency/deduplication, parsing/validation, acknowledgement rules,
and failure handling (DLQ/quarantine/replay). This template must be consistent with webhook
catalog and security rules and must not invent endpoints or secrets beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Event Catalog: {{whcp.catalog}}
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-05 Security Rules: {{whcp.security_rules}}
- WHCP-06 Registration/Management: {{whcp.registration}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- IXS-04 Secrets/Credentials Policy: {{ixs.secrets_policy}} | OPTIONAL
- IXS-06 Error Handling & Recovery: {{ixs.error_recovery}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Inbound endpoint regis... | spec         | Yes             |
| Which webhook_ids acce... | spec         | Yes             |
| Verification required ... | spec         | Yes             |
| Verification scheme (H... | spec         | Yes             |
| Secret/cert reference ... | spec         | Yes             |
| Allowlist rules (IP al... | spec         | Yes             |
| Payload parsing rules ... | spec         | Yes             |
| Idempotency key rules ... | spec         | Yes             |
| Ack rules (2xx on acce... | spec         | Yes             |
| Backpressure rules (qu... | spec         | Yes             |
| Failure handling (DLQ/... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Async processing model (job queue) | OPTIONAL
Replay endpoint support | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never process unverified webhooks when verification is required.**
- **Idempotency MUST be enforced; inbound duplicates must not cause repeated side effects.**
- **Ack behavior must be explicit and consistent with delivery semantics.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Inbound Endpoints`
2. `## Endpoint`
3. `## (Repeat per endpoint.)`
4. `## Verification`
5. `## Allowlists`
6. `## Parsing / Validation`
7. `## Idempotency`
8. `## Ack Rules`
9. `## Backpressure / Queueing`
10. `## Failure Handling`

## 8. Cross-References

- **Upstream: {{xref:WHCP-01}}, {{xref:WHCP-05}}, {{xref:SPEC_INDEX}} | OPTIONAL**
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
