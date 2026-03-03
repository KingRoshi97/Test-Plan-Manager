# MBAT-02 — Battery Impact Analysis

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-02                                          |
| Template Type     | Build / Mobile Performance                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring battery impact analysis   |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Battery Impact Analysis                   |

## 2. Purpose

Define the canonical mobile network usage policy: batching, concurrency limits, payload limits, metered network behavior, WiFi-only rules, retry/backoff, timeouts, and data saver mode support. This template must be consistent with retry patterns and avoid aggressive retries on metered networks. This template must not invent network policies not present in upstream inputs.

## 3. Inputs Required

- CPR-01: `{{cpr.budget}}` | OPTIONAL
- MBAT-01: `{{mbat.bg_work_rules}}` | OPTIONAL
- OFS-02: `{{ofs.sync_model}}` | OPTIONAL
- SMD-02: `{{smd.cache_strategy}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Batching rules | spec | No |
| Concurrency limits (max concurrent requests) | spec | No |
| Payload limits (max KB) | spec | No |
| Metered network behavior (restrict/allow) | spec | No |
| WiFi-only operations | spec | No |
| Retry/backoff policy | CER-02 | No |
| Timeout policy (connect timeout) | spec | No |
| Data saver mode support | spec | No |
| Telemetry requirements (bytes sent, network errors) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Regional network profiles | spec | Latency/bandwidth tiers |
| Open questions | agent | Enrichment only |

## 6. Rules

- Mobile network policy MUST respect retry patterns and avoid aggressive retries on metered networks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Batching` — batching_enabled, batching_rules
2. `## Concurrency Limits` — max_concurrent_requests, per_host_limits
3. `## Payload Limits` — max_payload_kb, streaming_allowed
4. `## Metered Network` — metered_behavior, restricted_operations
5. `## WiFi-Only Rules` — wifi_only_operations, override_allowed
6. `## Retry / Backoff` — retry_policy_ref, metered_retry_policy
7. `## Timeout Policy` — connect_timeout_ms, request_timeout_ms
8. `## Data Saver Mode` — data_saver_supported, data_saver_rules
9. `## Telemetry` — bytes_sent_metric, bytes_received_metric, network_error_metric

## 8. Cross-References

- **Upstream**: CPR-01, SPEC_INDEX
- **Downstream**: MBAT-03
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Batching/concurrency/payload basics | Not required | Required | Required |
| Metered + data saver + retry nuances | Not required | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, per-host limits, streaming allowed, restricted ops, override allowed, retry policy ref, metered retry policy, request timeout, saver rules, bytes received metric, regional profiles, open_questions
- If batch.rules is UNKNOWN → block Completeness Gate.
- If payload.max_kb is UNKNOWN → block Completeness Gate.
- If metered.behavior is UNKNOWN → block Completeness Gate.
- If telemetry.network_error_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] batching_and_limits_defined == true
- [ ] metered_and_wifi_rules_defined == true
- [ ] timeouts_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
