# PAY-02 — Payment Flow Spec (one-time, recurring, invoices)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-02                                             |
| Template Type     | Integration / Payments                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring payment flow spec (one-time, recurring, invoices)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Payment Flow Spec (one-time, recurring, invoices) Document                         |

## 2. Purpose

Define the canonical payment flows supported by the product (one-time, recurring, invoices):
steps, actors, API endpoints involved, UI touchpoints, provider interactions, and failure/retry
handling. This template must be consistent with provider inventory and must not invent payment
modes/endpoints not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- FE-01 Route Map: {{fe.route_layout}} | OPTIONAL
- FE-04 Data Binding Rules: {{fe.data_binding}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

provider_id binding
Supported flow types list (one_time/recurring/invoice)
Flow steps (client → server → provider)
Payment intent/checkout object rules (provider primitives)
Idempotency rules for create/confirm
Sensitive data handling (no raw card data)
Failure handling (declines, timeouts)
Retry rules (when allowed vs not)
UI touchpoints (screen_id/route_id)
API endpoints used (endpoint_id)
Telemetry requirements (success/fail, decline reasons)

Optional Fields
Offline/manual invoice flow | OPTIONAL
Proration rules (if subscriptions) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never handle raw card data unless explicitly in PCI scope; prefer provider tokenization.
All create/confirm operations MUST be idempotent.
Declines must not be retried blindly; use provider reason codes.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Flow Types
provider_id: {{meta.provider_id}}
flow_types: {{flows.types}}
2. Flow Definition (repeat per flow type)
Flow
flow_type: {{flows.items[0].flow_type}}
name: {{flows.items[0].name}}
ui_entry_route: {{flows.items[0].ui_entry_route}} | OPTIONAL
api_endpoints: {{flows.items[0].api_endpoints}}
provider_objects: {{flows.items[0].provider_objects}} | OPTIONAL
steps:
{{flows.items[0].steps[0]}}
{{flows.items[0].steps[1]}}
{{flows.items[0].steps[2]}} | OPTIONAL
3. Idempotency
idempotency_required: {{idem.required}}
key_rule: {{idem.key_rule}}
scope: {{idem.scope}} | OPTIONAL
4. Failure Handling
decline_handling: {{fail.decline_handling}}
timeout_handling: {{fail.timeout_handling}} | OPTIONAL
retry_rules: {{fail.retry_rules}}
5. Sensitive Data
tokenization_rule: {{security.tokenization_rule}}
no_raw_card_rule: {{security.no_raw_card_rule}}
6. Telemetry
payment_success_metric: {{telemetry.success_metric}}
payment_failure_metric: {{telemetry.failure_metric}} | OPTIONAL

decline_reason_metric: {{telemetry.decline_reason_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
7. References
Provider inventory: {{xref:PAY-01}}
Pricing/plan mapping: {{xref:PAY-03}} | OPTIONAL
Payment webhooks: {{xref:PAY-04}} | OPTIONAL
Refunds/disputes: {{xref:PAY-06}} | OPTIONAL
Security/PCI: {{xref:PAY-09}} | OPTIONAL
Cross-References
Upstream: {{xref:PAY-01}}, {{xref:API-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-04}}, {{xref:PAY-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define flow steps and endpoints and no-raw-card rule.
intermediate: Required. Define idempotency, failure handling, and telemetry.
advanced: Required. Add proration/invoice variants and detailed provider object mapping.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, ui entry, provider objects, optional steps,
scope, timeout handling, telemetry fields, invoice/proration, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If flows.types is UNKNOWN → block Completeness Gate.
If idem.key_rule is UNKNOWN → block Completeness Gate.
If security.no_raw_card_rule is UNKNOWN → block Completeness Gate.
If telemetry.success_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PAY
Pass conditions:
required_fields_present == true
flows_defined == true
idempotency_defined == true
sensitive_data_rules_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PAY-03

PAY-03 — Pricing & Plan Mapping (plans, tiers, entitlements)
Header Block

## 5. Optional Fields

Offline/manual invoice flow | OPTIONAL
Proration rules (if subscriptions) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never handle raw card data unless explicitly in PCI scope; prefer provider tokenization.**
- All create/confirm operations MUST be idempotent.
- **Declines must not be retried blindly; use provider reason codes.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Flow Types`
2. `## Flow Definition (repeat per flow type)`
3. `## Flow`
4. `## steps:`
5. `## Idempotency`
6. `## Failure Handling`
7. `## Sensitive Data`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:PAY-01}}, {{xref:API-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PAY-04}}, {{xref:PAY-07}} | OPTIONAL**
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
