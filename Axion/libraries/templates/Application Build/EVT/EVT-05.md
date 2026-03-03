# EVT-05 — Webhook Producer Spec (outbound webhooks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-05                                             |
| Template Type     | Build / Events                                     |
| Template Version  | 1.0.0                                              |
| Applies           | All projects producing outbound webhooks           |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, EVT-01, EVT-02, EVT-04 |
| Produces          | Filled Webhook Producer Spec                       |

## 2. Purpose

Define the canonical specification format for outbound webhooks produced by the system, including subscription model, delivery/auth/signing, retries, dedupe, rate limiting, payload binding to EVT schemas, and observability. This template must be consistent with the Event Catalog/Schema specs and must not invent webhook event_ids or capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- EVT-01: `{{evt.catalog}}`
- EVT-02: `{{evt.schemas}}`
- EVT-04: `{{evt.delivery_semantics}}`

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Webhook surface scope               | spec         | No              |
| Subscription model                  | spec         | No              |
| Endpoint configuration fields       | spec         | No              |
| Auth/signing model                  | spec         | No              |
| Delivery method + content type      | spec         | No              |
| Payload format (EVT-02 binding)     | EVT-02       | No              |
| Delivery semantics (retries/backoff)| EVT-04       | No              |
| Dedupe/idempotency guidance         | spec         | No              |
| Ordering guarantees                 | spec         | Yes             |
| Failure handling (disable/DLQ)      | spec         | No              |
| Rate limiting for outbound          | spec         | No              |
| Security constraints (SSRF/TLS)     | spec         | No              |
| Observability requirements          | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Event filtering rules       | spec   | Per-subscription filters         |
| Batching policy             | spec   | Only if applicable               |
| Compression policy          | spec   | Only if applicable               |
| Tenant-specific signing keys| spec   | Multi-tenant webhooks            |
| Custom headers policy       | spec   | Subscriber custom headers        |
| Open questions              | agent  | Flagged unknowns                 |

## 6. Rules

- Do not introduce new event_ids; use only those in EVT-01.
- Every webhook payload MUST reference a schema_ref from EVT-02.
- Signing/auth model MUST be explicit; if unknown, mark UNKNOWN and flag.
- Outbound delivery MUST follow delivery semantics in EVT-04 unless explicitly overridden.

## 7. Output Format

### Required Headings (in order)

1. `## Webhook Scope` — enabled, supported event_ids, subscription model
2. `## Subscription & Endpoint Configuration` — config fields (url, secret, headers, filters)
3. `## Authentication / Signing` — signing type, signature header, timestamp, replay protection
4. `## Delivery Request Format` — HTTP method, content type, timeout, TLS, redirect policy
5. `## Payload Binding` — envelope fields, schema_ref, PII policy
6. `## Delivery Semantics` — retry policy ref, backoff, max attempts, dedupe key, ordering
7. `## Failure Handling` — disable on fail, threshold, dead endpoint behavior, DLQ
8. `## Rate Limits & Abuse Controls` — outbound limits, per-destination, spike protection
9. `## Security Constraints` — SSRF protections, allowlist, TLS min version, secret storage
10. `## Observability` — delivery success rate, latency, retry count, failure count, logs, traces, alerts
11. `## References` — EVT-01, EVT-02, EVT-04, EVT-07, EVT-08, RLIM-01

## 8. Cross-References

- **Upstream**: EVT-01, EVT-02, EVT-04, SPEC_INDEX
- **Downstream**: EVT-06, EVT-07, EVT-08
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING, STD-SECURITY

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| UNKNOWN where not specified          | Required  | Required     | Required |
| Payload binding + retries/backoff    | Optional  | Required     | Required |
| SSRF protections + observability     | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, secret_ref, custom_headers, event_filters, enabled_flag, signature_header, timestamp_header, tolerance_seconds, replay_protection, redirect_policy, payload_ref, pii_policy, dedupe_key, ordering_guarantee, disable_threshold, dlq_supported, dlq_ref, ratelimit_policy, per_destination_limits, spike_protection, allowlist_policy, tls_min_version, secret_storage_policy, trace_attrs, alerts, open_questions
- If signing_enabled is UNKNOWN → flag in Open Questions.
- If tls_required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] all webhook event_ids exist in EVT-01
- [ ] payload_schema_ref_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
