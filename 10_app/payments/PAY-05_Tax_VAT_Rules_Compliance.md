# PAY-05 — Tax/VAT Rules & Compliance (if applicable)

## Header Block

| Field | Value |
|---|---|
| template_id | PAY-05 |
| title | Tax/VAT Rules & Compliance (if applicable) |
| type | payments_tax_vat_compliance |
| template_version | 1.0.0 |
| output_path | 10_app/payments/PAY-05_Tax_VAT_Rules_Compliance.md |
| compliance_gate_id | TMP-05.PRIMARY.PAY |
| upstream_dependencies | ["PAY-03", "PRD-06", "IXS-08"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "PAY-01", "PAY-03", "PRD-06", "IXS-08"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical tax/VAT handling rules for payments: whether taxes apply, how jurisdiction
is determined, how taxes are calculated/collected/remitted (or delegated to provider), what
user/business data is required, and compliance constraints. This template must not invent tax
obligations; unknowns must be explicitly marked UNKNOWN.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}} | OPTIONAL
- PAY-03 Pricing & Plan Mapping: {{pay.plans}} | OPTIONAL
- PRD-06 NFRs / Legal constraints: {{prd.nfrs}} | OPTIONAL
- IXS-08 Integration Security & Compliance: {{ixs.security_compliance}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Tax handling enabled (true/false/UNKNOWN)
- Tax model (provider-managed/manual/UNKNOWN)
- Supported jurisdictions list (countries/states)
- Jurisdiction determination rule (billing address, IP, etc.)
- Tax-exempt handling rules (if supported)
- Invoice/receipt tax line rules
- Stored tax data fields policy (PII minimization)
- Compliance notes (VAT IDs, W-9/W-8, etc. if applicable)
- Audit/retention policy for tax records
- Telemetry requirements (tax calculation failures)

## Optional Fields

- Product tax category mapping | OPTIONAL
- EU OSS/IOSS notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not provide legal conclusions; use upstream/legal inputs.
- Minimize stored tax PII; store only what is needed for compliance/audit.
- If taxes are enabled, the model MUST be explicit and implementable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Enablement
tax_enabled: {{tax.enabled}}
model: {{tax.model}} (provider_managed/manual/UNKNOWN)
2. Jurisdictions
supported_jurisdictions: {{jurisdictions.supported}}
determination_rule: {{jurisdictions.determination_rule}}
3. Tax Exemptions
exempt_supported: {{exempt.supported}}
exempt_rules: {{exempt.rules}} | OPTIONAL
4. Tax Lines on Invoices/Receipts
tax_line_rule: {{lines.tax_line_rule}}
rounding_rule: {{lines.rounding_rule}} | OPTIONAL
5. Data Handling
tax_data_fields: {{data.tax_data_fields}}
pii_minimization_rule: {{data.pii_minimization_rule}}
retention_policy: {{data.retention_policy}}
6. Compliance Notes
vat_id_supported: {{compliance.vat_id_supported}} | OPTIONAL
documentation_required: {{compliance.documentation_required}} | OPTIONAL
notes: {{compliance.notes}} | OPTIONAL
7. Audit / Telemetry
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
tax_calc_failure_metric: {{telemetry.tax_calc_failure_metric}}
8. References
Pricing/plans: {{xref:PAY-03}} | OPTIONAL
Provider inventory: {{xref:PAY-01}} | OPTIONAL
Security/compliance baseline: {{xref:IXS-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:PRD-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. State whether tax enabled and which jurisdictions; use UNKNOWN if legal
inputs absent.
intermediate: Required. Define determination rule, retention policy, and telemetry metric.
advanced: Required. Add product tax categories and exemption workflows and audit fields rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, exempt rules, rounding rule, compliance
fields, audit fields, category mapping, EU notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If tax.enabled is UNKNOWN → allowed, but MUST add to open_questions.
If tax.model is UNKNOWN and tax.enabled == true → block Completeness Gate.
If jurisdictions.determination_rule is UNKNOWN and tax.enabled == true → block Completeness
Gate.
If telemetry.tax_calc_failure_metric is UNKNOWN → block Completeness Gate (when
tax.enabled == true).

## Completeness Gate

Gate ID: TMP-05.PRIMARY.PAY
Pass conditions:
required_fields_present == true
if tax_enabled then model_and_jurisdiction_rules_defined == true
data_handling_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
