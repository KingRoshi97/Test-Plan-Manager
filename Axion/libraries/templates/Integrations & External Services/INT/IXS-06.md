# IXS-06 — Rate Limit & Quota Management

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-06                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring rate limit & quota manage |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-02, API-03, CER-02, JBS-04                   |
| Produces          | Filled Rate Limit & Quota Management             |

## 2. Purpose

Define the canonical error handling and recovery model for integrations: error taxonomy, retry/backoff behavior, idempotency expectations, fallbacks, DLQ/quarantine behavior, and operator actions (replay/backfill/disable). This template must be consistent with API error policy and job/event failure handling rules.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-02 Integration Specs: `{{ixs.integration_specs}}`
- API-03 Error & Status Code Policy: `{{api.error_policy}}` | OPTIONAL
- CER-02 Retry & Recovery Patterns: `{{cer.retry_patterns}}` | OPTIONAL
- JBS-04 Retry/DLQ Policy: `{{jobs.retry_dlq}}` | OPTIONAL
- EVT-07 Event Failure Handling: `{{evt.failure_handling}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Error taxonomy | Classes |
| Retry eligibility rules | By class |
| Backoff policy | And max attempts |
| Idempotency requirements | Per operation |
| Timeout handling policy | Budget and behavior |
| Fallback behaviors | Degraded mode / skip / queue |
| Quarantine/DLQ rules | When used, how to drain |
| Operator actions matrix | Disable integration, replay, backfill, rotate creds |
| User impact policy | Silent vs surfaced |
| Telemetry requirements | Error rates, retry counts, DLQ depth |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Per-integration overrides | OPTIONAL |
| Vendor-specific error mappings | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not "retry forever"; retries must be bounded and observable.
- Idempotency MUST be explicit for any operation that can be replayed.
- DLQ/quarantine MUST have a drain/replay policy.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-02}}`, `{{xref:API-03}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IXS-07}}`, `{{xref:ADMIN-02}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Define taxonomy + bounded retries + timeout budget; use UNKNOWN for vendor mappings.
- **intermediate**: Required. Define idempotency and DLQ rules and operator actions.
- **advanced**: Required. Add per-integration overrides and rigorous telemetry fields/runbook linkages.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, retry conditions, base/max delays, idempotency key/dedupe window, timeout on-timeout behavior, schema validation fallback, max age, op required role, notes, user copy policy ref, telemetry fields, overrides, vendor mappings, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `backoff.max_attempts` is UNKNOWN → block Completeness Gate.
- If `timeout.budget_ms` is UNKNOWN → block Completeness Gate.
- If `dlq.trigger_rule` is UNKNOWN → block Completeness Gate (when dlq.supported == true).
- If `telemetry.error_rate_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] bounded_retry_defined == true
- [ ] idempotency_defined == true
- [ ] dlq_and_replay_defined == true
- [ ] operator_actions_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

