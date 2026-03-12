# SIC-03 — Webhook Contract Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIC-03                                             |
| Template Type     | Architecture / Interfaces                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring webhook contract spec    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Webhook Contract Spec Document                         |

## 2. Purpose

Define the enforceable contract for webhooks (inbound and outbound): payload shape,
signature verification, replay protection, retry semantics, idempotency, and operational behavior.
This standardizes webhook behavior across vendors and internal producers.

## 3. Inputs Required

- ● SIC-01: {{xref:SIC-01}} | OPTIONAL
- ● ARC-07: {{xref:ARC-07}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Webhook list (minimum 3 if webhooks are used; otherwise mark N/A)
● For each webhook:
○ webhook_id
○ direction (inbound/outbound)
○ producer system
○ consumer system
○ endpoint URL pattern (for inbound) | OPTIONAL
○ event types supported
○ payload schema (typed)
○ signature scheme:
■ algorithm
■ secret/key reference (no raw secret)
■ header names
■ canonical signing string rules
○ replay protection:
■ timestamp header rules
■ tolerance window

■ nonce/idempotency key rule
○ delivery rules:
■ expected response codes
■ retry schedule/backoff
■ max attempts
■ dedupe rules
○ failure handling:
■ DLQ / quarantine rule
■ alerting rule
○ PII classification and redaction rules
○ observability fields (event_id, delivery_id, correlation_id)

## 5. Optional Fields

● Example payloads | OPTIONAL
● Vendor-specific quirks | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Inbound webhooks must verify signature and replay protection before processing.
- Processing must be idempotent; define the idempotency key.
- Retry behavior must not cause duplicate side effects.
- Never log raw secrets or full sensitive payload fields; apply redaction.
- Outbound webhooks must include a stable event_id and delivery_id.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Webhook Contracts (canonical)`
3. `## dire`
4. `## ctio`
5. `## pro`
6. `## duc`
7. `## con`
8. `## sum`
9. `## even`
10. `## t_typ`

## 8. Cross-References

- Upstream: {{xref:SIC-01}} | OPTIONAL, {{xref:ARC-07}} | OPTIONAL
- Downstream: {{xref:SIC-05}} | OPTIONAL, {{xref:ERR-05}} | OPTIONAL, {{xref:OBS-01}}
- | OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
