# API-07 — WebSocket API Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-07                                             |
| Template Type     | Build / API                                        |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with WebSocket-based realtime APIs    |
| Filled By         | Internal Agent                                     |
| Consumes          | RTM-02, RTM-03, RTM-04, ERR-03, PMAD-02, RLIM-01, OBS-01, Standards Index |
| Produces          | Filled WebSocket API Spec                          |

## 2. Purpose

Define the authoritative WebSocket API contract: connection/auth handshake, message envelope, message types, channel join/leave semantics, acknowledgments, error behavior, rate limits, and observability. This binds RTM architecture decisions to a build-ready interface spec.

## 3. Inputs Required

- RTM-02: `{{xref:RTM-02}}` | OPTIONAL
- RTM-03: `{{xref:RTM-03}}` | OPTIONAL
- RTM-04: `{{xref:RTM-04}}` | OPTIONAL
- ERR-03: `{{xref:ERR-03}}` | OPTIONAL
- PMAD-02: `{{xref:PMAD-02}}` | OPTIONAL
- RLIM-01: `{{xref:RLIM-01}}` | OPTIONAL
- OBS-01: `{{xref:OBS-01}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| WS URL(s) + env variants            | spec         | No              |
| Protocols/subprotocols              | spec         | No              |
| Auth handshake steps                | spec         | No              |
| Session/token validation point      | spec         | No              |
| Message envelope schema             | spec         | No              |
| Message types catalog (min 20)      | spec         | No              |
| Channel naming rules                | RTM-03       | No              |
| Channel join/publish/subscribe auth | spec         | No              |
| Delivery semantics (ordering)       | RTM-04       | No              |
| Dedupe rules                        | spec         | No              |
| Ack rules + retry rules             | spec         | No              |
| Error message shape (ERR-03)        | ERR-03       | No              |
| Close codes policy                  | spec         | No              |
| Rate limiting policy for WS         | RLIM         | No              |
| Observability requirements          | spec         | No              |
| Verification checklist              | spec         | No              |

## 5. Optional Fields

| Field Name                      | Source | Notes                          |
|---------------------------------|--------|--------------------------------|
| Compression/binary frames rules | spec   | Only if applicable             |
| Notes                           | agent  | Enrichment only, no new truth  |

## 6. Rules

- Must align to RTM-04 for delivery semantics (no surprise "exactly once").
- Authz must be server enforced on join and publish.
- Errors must use the ERR-03 shape; include reason_code.
- All message types must be enumerated and versioned.

## 7. Output Format

### Required Headings (in order)

1. `## Connection & Handshake` — WS URLs, subprotocol, handshake steps, auth validation
2. `## Message Envelope` — JSON envelope schema (msg_id, type, channel, payload, timestamp, correlation_id)
3. `## Message Types Catalog` — Table: type, direction, payload_schema_ref, requires_auth, authz_policy_ref, ack_required, notes
4. `## Channel Rules` — naming patterns, join auth, publish auth, subscribe rules
5. `## Delivery Semantics` — ordering, dedupe, ack rules, retry rules
6. `## Errors & Close Codes` — error payload shape, reason code mapping, close codes
7. `## Rate Limits` — WS rate limit pointer, per-connection limits
8. `## Observability` — required log fields, metrics, tracing
9. `## Verification Checklist` — validation checks

## 8. Cross-References

- **Upstream**: RTM-02, RTM-04, ERR-03
- **Downstream**: FE-07, SMD-04, QA-04
- **Standards**: STD-SECURITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Handshake + envelope + msg types     | Required  | Required     | Required |
| Authz policies + delivery semantics  | Optional  | Required     | Required |
| Error mapping + rate limits + obs    | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: compression_rules, notes, close_codes_policy, metrics, tracing
- If any authenticated message type lacks authz_policy_ref → block Completeness Gate.
- If any error path lacks reason_code mapping → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] handshake_defined == true
- [ ] message_types_count >= 20
- [ ] authz_defined_for_protected_types == true
- [ ] error_contract_aligned == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
