# WHCP-02 — Outbound Webhook Producer Spec (signing, retries, dedupe)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-02                                             |
| Template Type     | Integration / Webhooks                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring outbound webhook producer spec (signing, retries, dedupe)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Outbound Webhook Producer Spec (signing, retries, dedupe) Document                         |

## 2. Purpose

Define the canonical outbound webhook producer behavior: how events are selected and
serialized, signature/signing rules, endpoint targeting/subscriptions, retries/backoff,
deduplication/idempotency, and failure handling. This template must be consistent with webhook
catalog, delivery semantics, and security rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Event Catalog: {{whcp.catalog}}
- EVT-02 Event Schema Spec: {{evt.schema_spec}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-05 Security Rules: {{whcp.security_rules}} | OPTIONAL
- WHCP-06 Registration/Management: {{whcp.registration}} | OPTIONAL
- IXS-03 Connectivity Policy: {{ixs.network_policy}} | OPTIONAL
- IXS-04 Secrets/Credentials Policy: {{ixs.secrets_policy}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Producer identity (ser... | spec         | Yes             |
| Payload schema version... | spec         | Yes             |
| Target resolution (sub... | spec         | Yes             |
| HTTP method/headers po... | spec         | Yes             |
| Signing supported (yes... | spec         | Yes             |
| Signing scheme (HMAC/J... | spec         | Yes             |
| Signature header fields   | spec         | Yes             |
| Retries supported + ba... | spec         | Yes             |
| Max attempts and dead-... | spec         | Yes             |
| Deduplication/idempote... | spec         | Yes             |
| Rate caps (per subscri... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Batching support | OPTIONAL
Compression support | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not send PII unless explicitly allowed by schema/security policies.
- **Retries must be bounded; dedupe must prevent duplicate side effects.**
- **Signing secrets must be handled per {{xref:IXS-04}}; never log them.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Producer Identity`
2. `## Emitted Webhooks`
3. `## Payload Versioning`
4. `## OPTIONAL`
5. `## Target Resolution`
6. `## HTTP Policy`
7. `## Signing`
8. `## Retries / Backoff`
9. `## Dedupe / Idempotency`
10. `## DLQ / Quarantine`

## 8. Cross-References

- **Upstream: {{xref:WHCP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
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
