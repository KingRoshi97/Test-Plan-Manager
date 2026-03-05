# MBAT-02 — Network Usage Policy (batching, retries, metered)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-02                                             |
| Template Type     | Build / Mobile Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring network usage policy (batching, retries, metered)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Network Usage Policy (batching, retries, metered) Document                         |

## 2. Purpose

Define the canonical policy for mobile network usage: batching rules, metered network behavior,
retry/backoff behavior, payload limits, and data-saver mode behavior. This template must be
consistent with performance budgets, retry patterns, and sync model and must not invent
network policies not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CPR-01 Performance Budget: {{cpr.budget}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- OFS-02 Sync Model: {{ofs.sync_model}} | OPTIONAL
- SMD-02 Cache Strategy: {{smd.cache_strategy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Batching rules (what c... | spec         | Yes             |
| Request concurrency li... | spec         | Yes             |
| Payload size limits (p... | spec         | Yes             |
| Metered network behavi... | spec         | Yes             |
| WiFi-only rules for he... | spec         | Yes             |
| Retry/backoff binding ... | spec         | Yes             |
| Timeout policy (mobile)   | spec         | Yes             |
| Data saver mode behavi... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Regional network profiles | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Mobile network policy MUST respect retry patterns and avoid aggressive retries on metered
networks.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Batching
batching_enabled: {{batch.enabled}}
batching_rules: {{batch.rules}}
2. Concurrency Limits
max_concurrent_requests: {{conc.max_requests}}
per_host_limits: {{conc.per_host_limits}} | OPTIONAL
3. Payload Limits
max_payload_kb: {{payload.max_kb}}
streaming_allowed: {{payload.streaming_allowed}} | OPTIONAL
4. Metered Network
metered_behavior: {{metered.behavior}} (restrict/allow/UNKNOWN)
restricted_operations: {{metered.restricted_ops}} | OPTIONAL
5. WiFi-Only Rules
wifi_only_operations: {{wifi.only_ops}}
override_allowed: {{wifi.override_allowed}} | OPTIONAL
6. Retry/Backoff
retry_policy_ref: {{retry.policy_ref}} (expected: {{xref:CER-02}}) | OPTIONAL
metered_retry_policy: {{retry.metered_policy}} | OPTIONAL
7. Timeout Policy
connect_timeout_ms: {{timeout.connect_ms}}
request_timeout_ms: {{timeout.request_ms}} | OPTIONAL
8. Data Saver Mode
data_saver_supported: {{saver.supported}}
data_saver_rules: {{saver.rules}} | OPTIONAL
9. Telemetry
bytes_sent_metric: {{telemetry.bytes_sent_metric}}
bytes_received_metric: {{telemetry.bytes_received_metric}} | OPTIONAL
network_error_metric: {{telemetry.network_error_metric}}
10.References
Performance budget: {{xref:CPR-01}} | OPTIONAL
Retry patterns: {{xref:CER-02}} | OPTIONAL
Sync model: {{xref:OFS-02}} | OPTIONAL
Cache strategy: {{xref:SMD-02}} | OPTIONAL
Cross-References
Upstream: {{xref:CPR-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:MBAT-03}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define batching/concurrency/payload + metered behavior.
advanced: Required. Add data saver profiles and metered retry nuances.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, per-host limits, streaming allowed,
restricted ops, override allowed, retry policy ref, metered retry policy, request timeout, saver
rules, bytes received metric, regional profiles, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If batch.rules is UNKNOWN → block Completeness Gate.
If payload.max_kb is UNKNOWN → block Completeness Gate.
If metered.behavior is UNKNOWN → block Completeness Gate.
If telemetry.network_error_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MBAT
Pass conditions:
required_fields_present == true
batching_and_limits_defined == true
metered_and_wifi_rules_defined == true
timeouts_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MBAT-03

MBAT-03 — Battery Budget & Constraints (targets)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Mobile network policy MUST respect retry patterns and avoid aggressive retries on metered**
- **networks.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Batching`
2. `## Concurrency Limits`
3. `## Payload Limits`
4. `## Metered Network`
5. `## WiFi-Only Rules`
6. `## Retry/Backoff`
7. `## Timeout Policy`
8. `## Data Saver Mode`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:CPR-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MBAT-03}} | OPTIONAL**
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
