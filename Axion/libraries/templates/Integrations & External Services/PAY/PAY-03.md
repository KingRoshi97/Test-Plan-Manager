# PAY-03 — Pricing & Tax Rules (calculations, rounding, jurisdiction)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-03                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring pricing & tax rules (calc |
| Filled By         | Internal Agent                                   |
| Consumes          | PRD-06, FFCFG-01, API-04                         |
| Produces          | Filled Pricing & Tax Rules (calculations, roundin|

## 2. Purpose

Define the canonical mapping from product pricing/plans to payment-provider products/prices, and how those plans map to internal entitlements/feature access. This template must be consistent with AuthZ/entitlements and must not invent plan IDs beyond upstream inputs.

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

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Plan registry (plan_id li | spec         | No              |
| plan_id (stable identifie | spec         | No              |
| plan name                 | spec         | No              |
| billing cadence (monthly/ | spec         | No              |
| price points (amount/curr | spec         | No              |
| provider mapping (provide | spec         | No              |
| trial policy (if any)     | spec         | No              |
| entitlements granted (rol | spec         | No              |
| upgrade/downgrade rules   | spec         | No              |
| cancellation policy (end  | spec         | No              |
| tax behavior flag (if app | spec         | No              |
| telemetry requirements (p | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Grandfathering rules      | spec         | Enrichment only, no new truth  |
| Promo codes/coupons polic | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent plan_ids; use only {{spec.plans_by_id}} if present, else mark UNKNOWN and flag.
- Entitlements must bind to existing role/permission/flag IDs.
- Price changes must follow change management (IXS-10) if external-facing.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Pricing & Tax Rules (calculations, rounding, jurisdiction)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRD-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, provider product/price ids, trial
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If items[].plan_id is UNKNOWN → block Completeness Gate.
- If items[].provider_map.provider_id is UNKNOWN → block Completeness Gate.
- If items[*].entitlements is UNKNOWN → block Completeness Gate.
- If telemetry.conversion_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] plan_ids_unique == true
- [ ] provider_mappings_defined == true
- [ ] entitlements_bind_to_existing_ids == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-04
