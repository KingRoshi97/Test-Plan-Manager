# RTM-04 — Delivery Semantics (ordering,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RTM-04                                             |
| Template Type     | Architecture / Realtime                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring delivery semantics (ordering,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Delivery Semantics (ordering, Document                         |

## 2. Purpose

Define the delivery guarantees and semantics for realtime messages/updates: ordering,
deduplication, acknowledgments, retries, replay, and how clients reconcile state. This prevents
subtle realtime bugs and makes behavior testable.

## 3. Inputs Required

- ● RTM-01: {{xref:RTM-01}} | OPTIONAL
- ● RTM-02: {{xref:RTM-02}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● OBS-01: {{xref:OBS-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Ordering rules:           | spec         | Yes             |
| ○ per-channel ordering... | spec         | Yes             |
| ○ cross-channel orderi... | spec         | Yes             |
| Dedupe rules:             | spec         | Yes             |
| ○ message_id generatio... | spec         | Yes             |
| ○ dedupe window/ttl       | spec         | Yes             |
| ○ idempotency handling... | spec         | Yes             |
| Ack rules:                | spec         | Yes             |
| ○ when server acks        | spec         | Yes             |
| ○ client ack requireme... | spec         | Yes             |
| ○ retry triggers          | spec         | Yes             |
| Replay/backfill rules:    | spec         | Yes             |

## 5. Optional Fields

● Exactly-once disclaimer | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Do not claim exactly-once unless proven; default to at-least-once with dedupe.
- Ordering must be explicit; if not guaranteed, clients must tolerate reordering.
- Dedupe must be deterministic and scoped (channel + sender + message_id).
- Replay must enforce auth checks (no history leaks).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Delivery Posture (required)`
2. `## 2) Ordering Rules (required)`
3. `## 3) Message Identity & Dedupe (required)`
4. `## 4) Acknowledgments & Retries (required)`
5. `## 5) Replay / History (required if used)`
6. `## 6) Client Reconciliation (required)`
7. `## 7) Test Requirements (required)`

## 8. Cross-References

- Upstream: {{xref:RTM-02}} | OPTIONAL, {{xref:ERR-05}} | OPTIONAL
- Downstream: {{xref:RTM-05}}, {{xref:RTM-06}} | OPTIONAL, {{xref:QA-04}} | OPTIONAL
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
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
