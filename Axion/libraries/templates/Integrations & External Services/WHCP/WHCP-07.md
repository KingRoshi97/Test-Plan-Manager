# WHCP-07 — Error Handling (DLQ, quarantine, manual replay)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-07                                             |
| Template Type     | Integration / Webhooks                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error handling (dlq, quarantine, manual replay)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error Handling (DLQ, quarantine, manual replay) Document                         |

## 2. Purpose

Define the canonical error handling lifecycle for webhooks (inbound and outbound): how failures
are classified, when items go to DLQ/quarantine, how manual replay works, and what operator
actions exist. This template must be consistent with delivery semantics and global integration
error handling.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-02 Outbound Producer Spec: {{whcp.outbound}} | OPTIONAL
- WHCP-03 Inbound Consumer Spec: {{whcp.inbound}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}}
- IXS-06 Integration Error Handling: {{ixs.error_recovery}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jobs.retry_dlq}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Retry exhaustion rule ... | spec         | Yes             |
| DLQ/quarantine support... | spec         | Yes             |
| DLQ trigger rule          | spec         | Yes             |
| Quarantine contents (w... | spec         | Yes             |
| Replay supported (yes/... | spec         | Yes             |
| Replay authorization r... | spec         | Yes             |
| Replay scope rules (by... | spec         | Yes             |
| Backfill/retry safety ... | spec         | Yes             |
| Operator actions (paus... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Audit logging requirem... | spec         | Yes             |

## 5. Optional Fields

Auto-replay policy | OPTIONAL
Customer notification policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not DLQ raw secrets or unredacted PII.
- **Replay must not violate ordering/duplication rules; idempotency must be enforced.**
- **Operator actions must be permissioned and auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Failure Taxonomy`
2. `## Retry Exhaustion`
3. `## OPTIONAL`
4. `## DLQ / Quarantine`
5. `## Replay`
6. `## Operator Actions`
7. `## Action`
8. `## (Repeat per action.)`
9. `## Auto-Replay (Optional)`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:WHCP-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:WHCP-08}}, {{xref:ADMIN-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
