# PAY-03 — Pricing & Plan Mapping (plans, tiers, entitlements)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-03                                             |
| Template Type     | Integration / Payments                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring pricing & plan mapping (plans, tiers, entitlements)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Pricing & Plan Mapping (plans, tiers, entitlements) Document                         |

## 2. Purpose

Define the canonical mapping from product pricing/plans to payment-provider products/prices,
and how those plans map to internal entitlements/feature access. This template must be
consistent with AuthZ/entitlements and must not invent plan IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PRD-06 NFRs / Monetization constraints: {{prd.nfrs}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- API-04 AuthZ Rules (roles/entitlements): {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Plan registry (plan_id list)
plan_id (stable identifier)
plan name
billing cadence (monthly/annual/one-time)
price points (amount/currency)
provider mapping (provider_id + product/price ids)
trial policy (if any)
entitlements granted (role/permission/feature flags)
upgrade/downgrade rules
cancellation policy (end of term vs immediate)
tax behavior flag (if applicable)
telemetry requirements (plan conversions, churn)

Optional Fields
Grandfathering rules | OPTIONAL
Promo codes/coupons policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not invent plan_ids; use only {{spec.plans_by_id}} if present, else mark UNKNOWN and flag.
Entitlements must bind to existing role/permission/flag IDs.
Price changes must follow change management (IXS-10) if external-facing.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Plan Registry Summary
total_plans: {{plans.total}}
notes: {{plans.notes}} | OPTIONAL
2. Plan Entries (by plan_id)
Plan
plan_id: {{items[0].plan_id}}
name: {{items[0].name}}
cadence: {{items[0].cadence}}
price: {{items[0].price}}
provider_map:
provider_id: {{items[0].provider_map.provider_id}}
provider_product_id: {{items[0].provider_map.product_id}} | OPTIONAL
provider_price_id: {{items[0].provider_map.price_id}} | OPTIONAL
trial_policy: {{items[0].trial_policy}} | OPTIONAL
entitlements: {{items[0].entitlements}}
upgrade_rules: {{items[0].upgrade_rules}}
downgrade_rules: {{items[0].downgrade_rules}} | OPTIONAL
cancellation_policy: {{items[0].cancellation_policy}}
tax_flag: {{items[0].tax_flag}} | OPTIONAL
grandfathering: {{items[0].grandfathering}} | OPTIONAL
promo_policy: {{items[0].promo_policy}} | OPTIONAL
open_questions:
{{items[0].open_questions[0]}} | OPTIONAL
(Repeat per plan.)
3. Telemetry
conversion_metric: {{telemetry.conversion_metric}}

churn_metric: {{telemetry.churn_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
4. References
Provider inventory: {{xref:PAY-01}} | OPTIONAL
Payment flow spec: {{xref:PAY-02}} | OPTIONAL
Payment webhooks: {{xref:PAY-04}} | OPTIONAL
Change management: {{xref:IXS-10}} | OPTIONAL
Feature flags: {{xref:FFCFG-01}} | OPTIONAL
AuthZ/entitlements: {{xref:API-04}} | OPTIONAL
Cross-References
Upstream: {{xref:PRD-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define plan registry + prices + entitlements; do not invent IDs.
intermediate: Required. Define upgrade/downgrade/cancellation rules and provider mappings.
advanced: Required. Add grandfathering/promos and strict telemetry + change management
linkage.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, provider product/price ids, trial
policy, downgrade rules, tax flag, grandfathering, promo policy, churn metric/fields,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If items[].plan_id is UNKNOWN → block Completeness Gate.
If items[].provider_map.provider_id is UNKNOWN → block Completeness Gate.
If items[*].entitlements is UNKNOWN → block Completeness Gate.
If telemetry.conversion_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PAY
Pass conditions:
required_fields_present == true
plan_ids_unique == true
provider_mappings_defined == true
entitlements_bind_to_existing_ids == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PAY-04

PAY-04 — Webhook Handling for Payments (events, idempotency, retries)
Header Block

## 5. Optional Fields

Grandfathering rules | OPTIONAL
Promo codes/coupons policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent plan_ids; use only {{spec.plans_by_id}} if present, else mark UNKNOWN and flag.
- **Entitlements must bind to existing role/permission/flag IDs.**
- **Price changes must follow change management (IXS-10) if external-facing.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Plan Registry Summary`
2. `## Plan Entries (by plan_id)`
3. `## Plan`
4. `## provider_map:`
5. `## open_questions:`
6. `## (Repeat per plan.)`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRD-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL**
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
