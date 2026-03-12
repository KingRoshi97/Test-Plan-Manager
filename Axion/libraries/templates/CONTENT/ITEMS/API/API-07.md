# API-07 — WebSocket API Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-07                                             |
| Template Type     | Build / API                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring websocket api spec    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled WebSocket API Spec Document                         |

## 2. Purpose

Define the build-authoritative WebSocket interface: connection URL(s),
authentication/authorization handshake, message envelope, message types, channel
semantics, acknowledgments, delivery semantics, error/close behavior, rate limits, and required
observability fields.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- ●
- ●
- ●
- ●
- RTM-01: {{xref:RTM-01}} | OPTIONAL
- RTM-02: {{xref:RTM-02}} | OPTIONAL
- RTM-03: {{xref:RTM-03}} | OPTIONAL
- RTM-04: {{xref:RTM-04}} | OPTIONAL
- PMAD-02: {{xref:PMAD-02}} | OPTIONAL
- ERR-02: {{xref:ERR-02}} | OPTIONAL
- ERR-03: {{xref:ERR-03}} | OPTIONAL
- RLIM-01: {{xref:RLIM-01}} | OPTIONAL
- OBS-01: {{xref:OBS-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

A) Connection & Transport (required)

● WS URL(s) per environment
● Supported protocols/subprotocols
● Heartbeat/ping policy:
○ interval
○ timeout
○ client reconnection trigger
● Compression/binary policy (allowed/forbidden)
● Max message size (bytes)
● Origin/CORS-like policy (if browser clients)
● Verification checklist

B) Auth Handshake (required)
● Authn model:
○ token type (session/JWT)
○ where token is provided (query/header/first message)
○ refresh/rotation posture
● Authz model:
○ how role/permissions are derived
○ default deny policy
● Handshake sequence (ordered steps)
● Failure behaviors:
○ auth failure close code
○ reason_code mapping
○ retry guidance

C) Message Envelope (required)
● Required fields:
○ msg_id (client or server generated)
○ type
○ direction (c2s/s2c) | OPTIONAL
○ channel (string)
○ payload (object)
○ ts (ISO8601)
○ correlation_id
○ request_id | OPTIONAL
○ reply_to (msg_id) | OPTIONAL
● Versioning:
○ envelope_version
○ message schema version posture

D) Message Types Catalog (required; minimum 25)

For each type:
●
●
●
●
●
●
●
●
●

type name
direction
payload schema ref OR inline schema
auth required (yes/no)
authz policy id (PMAD) if protected
rate limit binding (RLIM limit_id/class) | OPTIONAL
ack required (yes/no)
idempotency/dedupe key stance (msg_id, payload key)
error behavior on invalid payload (reason_code)

E) Channel Semantics (required)
● Channel naming rules pointer (RTM-03)
● Channel types supported (room, dm, system, stream, presence)
● Join/leave semantics:
○ who can join
○ who can publish
○ who can subscribe
● Subscription lifecycle:
○ auto-subscribe policy (if any)
○ resubscribe on reconnect rules
● Presence rules (if used) | OPTIONAL

F) Delivery Semantics & Acks (required)
● Delivery posture (at-least-once vs best-effort) by message type
● Ordering guarantees scope (per-channel/per-user/none)
● Ack model:
○ ack payload fields
○ ack timeout policy
○ retry policy
● Dedupe rules:
○ dedupe window
○ duplicate handling (drop/merge)
● Backpressure policy:
○ server → client throttling
○ client publish throttling

G) Errors & Close Codes (required)
● Error payload shape (must align with ERR-03):
○ error_id

○ reason_code
○ message_safe
○ retryable
○ details (redacted)
○ correlation_id
● Close codes catalog (minimum 10):
○ auth failed
○ policy violation
○ message too large
○ rate limited
○ server shutdown
● Mapping table:
○ condition → close_code → reason_code → client action

H) Observability (required)
● Required log fields:
○ connection_id
○ user_id/tenant_id (hashed where needed)
○ channel
○ msg_id
○ type
○ direction
○ reason_code (if error)
○ correlation_id
○ latency_ms (if measurable)
● Metrics catalog (minimum 15):
○ connections_opened
○ connections_active
○ reconnects
○ messages_in/out
○ publish_failures
○ auth_failures
○ ack_timeouts
● Alerts (minimum 8)

## 5. Optional Fields

● Binary frames spec | OPTIONAL
● Encryption/pinning notes (mobile) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Must align with RTM delivery semantics (RTM-04). No “exactly once” promises unless
- **proven.**
- Protected message types must have explicit policy_id.
- All errors must provide a reason_code and use the standard error shape.
- Server must enforce authz on join and publish (not client-side).
- Rate limiting must be specified for publish-heavy message types.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Connection & Transport`
2. `## 2) Handshake Sequence (ordered)`
3. `## 3) Message Envelope (canonical)`
4. `## 4) Message Types Catalog`
5. `## dir`
6. `## tio`
7. `## payload_r`
8. `## auth`
9. `## _req`
10. `## uire`

## 8. Cross-References

- Upstream: {{xref:RTM-04}} | OPTIONAL, {{xref:PMAD-02}} | OPTIONAL, {{xref:ERR-03}}
- | OPTIONAL
- Downstream: {{xref:SMD-04}} | OPTIONAL, {{xref:RLIM-02}} | OPTIONAL, {{xref:QA-04}}
- | OPTIONAL
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
