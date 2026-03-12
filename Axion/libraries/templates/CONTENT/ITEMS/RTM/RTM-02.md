# RTM-02 — Protocol & Transport Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RTM-02                                             |
| Template Type     | Architecture / Realtime                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring protocol & transport map    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Protocol & Transport Map Document                         |

## 2. Purpose

Define which transports/protocols are used for each realtime use case
(WS/WebRTC/pubsub/queue), how connections are established, what the fallback rules are,
and what constraints apply (auth, ordering, retries, congestion control).

## 3. Inputs Required

- ● RTM-01: {{xref:RTM-01}} | OPTIONAL
- ● ARC-05: {{xref:ARC-05}} | OPTIONAL
- ● SBDT-02: {{xref:SBDT-02}} | OPTIONAL
- ● PMAD-01: {{xref:PMAD-01}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Transport list (WS/Web... | spec         | Yes             |
| For each transport:       | spec         | Yes             |
| ○ transport_id            | spec         | Yes             |
| ○ protocol                | spec         | Yes             |
| ○ intended use cases      | spec         | Yes             |
| ○ connection model (cl... | spec         | Yes             |
| ○ auth model (when and... | spec         | Yes             |
| ○ reliability guarante... | spec         | Yes             |
| ○ congestion/backpress... | spec         | Yes             |
| ○ fallback behavior if... | spec         | Yes             |
| ○ limits (message size... | spec         | Yes             |
| Reconnect strategy rul... | spec         | Yes             |

## 5. Optional Fields

● Mobile network constraints notes | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- Every realtime use case must have a defined fallback.
- Auth must be validated server-side on connect/join and on send.
- Backpressure rules must prevent memory blowups.
- Any retry must respect idempotency/dedupe rules (ERR-05, RTM-04).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Transports (required)`
2. `## tra protoco`
3. `## por`
4. `## t_i`
5. `## intende`
6. `## d_use`
7. `## auth_mod`
8. `## guarantees`
9. `## backpre`
10. `## ssure`

## 8. Cross-References

- Upstream: {{xref:RTM-01}} | OPTIONAL, {{xref:ARC-05}} | OPTIONAL
- Downstream: {{xref:RTM-03}}, {{xref:RTM-04}}, {{xref:RTM-06}} | OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
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
