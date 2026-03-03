# EVT-06 — Webhook Consumer Spec (inbound webhooks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-06                                             |
| Template Type     | Build / Events                                     |
| Template Version  | 1.0.0                                              |
| Applies           | All projects consuming inbound webhooks            |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, EVT-01, EVT-02, EVT-04, API-01, API-02, RLIM-01 |
| Produces          | Filled Webhook Consumer Spec                       |

## 2. Purpose

Define the canonical specification format for inbound webhooks consumed by the system, including endpoint surface, authentication/verification, validation, idempotency/deduplication, replay protection, rate limiting/abuse controls, mapping into internal events or jobs, and observability. This template must be consistent with API endpoint specs and eventing delivery semantics and must not invent inbound sources or contracts not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- EVT-01: `{{evt.catalog}}` | OPTIONAL
- EVT-02: `{{evt.schemas}}` | OPTIONAL
- EVT-04: `{{evt.delivery_semantics}}` | OPTIONAL
- API-01: `{{api.endpoint_catalog}}`
- API-02: `{{api.endpoint_specs}}`
- RLIM-01: `{{rlim.policy}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Inbound sources catalog             | spec         | No              |
| Endpoint mapping (source → ep)      | API-01       | No              |
| Auth/verification model             | spec         | No              |
| Replay protection model             | spec         | No              |
| Payload validation rules            | spec         | No              |
| Normalization/mapping rules         | spec         | No              |
| Idempotency/dedup rules             | spec         | No              |
| Rate limiting / abuse controls      | RLIM         | No              |
| Failure response policy             | API-03       | No              |
| Retry semantics expectations        | spec         | No              |
| Security constraints                | spec         | No              |
| Observability requirements          | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Batching support            | spec   | Only if applicable               |
| Encryption requirements     | spec   | Transport-level                  |
| Quarantine mode             | spec   | Store + manual review            |
| Per-source feature flag     | FFCFG  | Per-source enablement            |
| Dead-letter storage rules   | spec   | DLQ for inbound                  |
| Open questions              | agent  | Flagged unknowns                 |

## 6. Rules

- Do not invent inbound sources; source_id MUST come from inputs or be UNKNOWN.
- Inbound webhook endpoints MUST be defined in API-01 and specified in API-02.
- Verification MUST be explicit; if unknown, mark UNKNOWN and flag.
- Idempotency MUST be deterministic if claimed (key-based).
- Failure responses MUST follow API-03.

## 7. Output Format

### Required Headings (in order)

1. `## Inbound Sources Summary` — total sources, list
2. `## Source Registry` — Repeating blocks: source_id, name, owner, expected_sender, enabled, feature_flag
3. `## Endpoint Mapping` — source_id → endpoint_id, path, method
4. `## Authentication / Verification` — verification type, secret ref, signature/timestamp headers, tolerance
5. `## Replay Protection` — enabled, nonce, binding rule, window
6. `## Payload Validation` — content type, max body, required headers, schema validation, invalid behavior
7. `## Normalization / Mapping` — internal target, target ref, field mapping, PII handling
8. `## Idempotency / Deduplication` — enabled, key rule, window, on_duplicate
9. `## Rate Limits & Abuse Controls` — policy ref, per-source/global limits, abuse signals
10. `## Failure Response Policy` — success/invalid/rate-limited/error response codes
11. `## Sender Retry Expectations` — retry_on, backoff, max window
12. `## Security Constraints` — parser hardening, header allowlist, JSON depth, redaction
13. `## Observability` — accept/reject counts, latency, dedupe hits, logs, traces, alerts
14. `## References` — API-01, API-02, API-03, EVT-04, RLIM-01, API-06

## 8. Cross-References

- **Upstream**: API-01, API-02, EVT-04, SPEC_INDEX
- **Downstream**: EVT-07, EVT-08
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING, STD-SECURITY

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| UNKNOWN where not provided           | Required  | Required     | Required |
| Verification + validation + dedupe   | Optional  | Required     | Required |
| Replay protection + observability    | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, owner, expected_sender, feature_flag, secret_ref, signature_header, timestamp_header, tolerance_seconds, ip_allowlist, mtls_requirements, nonce_required, nonce_store, replay_window, required_headers, schema_validation, field_mapping_rules, pii_handling, dedupe_window, per_source_limits, global_limits, abuse_signals, enforcement_actions, error_body_policy, sender_backoff, max_retry_window, header_allowlist, json_depth_limits, logging_redaction, trace_attrs, alerts, open_questions
- If verification_required is UNKNOWN → flag in Open Questions.
- If max_body_bytes is UNKNOWN → block Completeness Gate.
- If dedupe_key_rule is UNKNOWN while dedupe_enabled == true → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] all inbound endpoints exist in API-01/API-02
- [ ] verification_model_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
