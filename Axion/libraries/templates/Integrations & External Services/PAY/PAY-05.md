# PAY-05 — Tax/VAT Rules & Compliance (if applicable)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-05                                             |
| Template Type     | Integration / Payments                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring tax/vat rules & compliance (if applicable)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Tax/VAT Rules & Compliance (if applicable) Document                         |

## 2. Purpose

Define the canonical tax/VAT handling rules for payments: whether taxes apply, how jurisdiction
is determined, how taxes are calculated/collected/remitted (or delegated to provider), what
user/business data is required, and compliance constraints. This template must not invent tax
obligations; unknowns must be explicitly marked UNKNOWN.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}} | OPTIONAL
- PAY-03 Pricing & Plan Mapping: {{pay.plans}} | OPTIONAL
- PRD-06 NFRs / Legal constraints: {{prd.nfrs}} | OPTIONAL
- IXS-08 Integration Security & Compliance: {{ixs.security_compliance}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Tax handling enabled (... | spec         | Yes             |
| Tax model (provider-ma... | spec         | Yes             |
| Supported jurisdiction... | spec         | Yes             |
| Jurisdiction determina... | spec         | Yes             |
| Tax-exempt handling ru... | spec         | Yes             |
| Invoice/receipt tax li... | spec         | Yes             |
| Stored tax data fields... | spec         | Yes             |
| Compliance notes (VAT ... | spec         | Yes             |
| Audit/retention policy... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Product tax category mapping | OPTIONAL

EU OSS/IOSS notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not provide legal conclusions; use upstream/legal inputs.
- **Minimize stored tax PII; store only what is needed for compliance/audit.**
- If taxes are enabled, the model MUST be explicit and implementable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Enablement`
2. `## Jurisdictions`
3. `## Tax Exemptions`
4. `## Tax Lines on Invoices/Receipts`
5. `## Data Handling`
6. `## Compliance Notes`
7. `## Audit / Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRD-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. State whether tax enabled and which jurisdictions; use UNKNOWN if legal**
- inputs absent.
- **intermediate: Required. Define determination rule, retention policy, and telemetry metric.**
- **advanced: Required. Add product tax categories and exemption workflows and audit fields rigor.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, exempt rules, rounding rule, compliance**
- fields, audit fields, category mapping, EU notes, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If tax.enabled is UNKNOWN → allowed, but MUST add to open_questions.
- If tax.model is UNKNOWN and tax.enabled == true → block

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
