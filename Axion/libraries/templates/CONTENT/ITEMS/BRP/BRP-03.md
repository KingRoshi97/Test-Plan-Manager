# BRP-03 — Pricing/Permission Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | BRP-03                                             |
| Template Type     | Product / Business Rules                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring pricing/permission policy    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Pricing/Permission Policy Document                         |

## 2. Purpose

Capture policy rules that govern pricing, billing permissions, and paywall behavior (if the product
has monetization). This informs PAY/REVOPS, UI gating, and entitlements enforcement.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- BRP-02: {{xref:BRP-02}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Pricing notes: {{inputs.pricing_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Pricing constructs (pl... | spec         | Yes             |
| Paywall rules (what ha... | spec         | Yes             |
| Upgrade/downgrade rule... | spec         | Yes             |
| Proration/refund polic... | spec         | Yes             |

## 5. Optional Fields

● Taxes/invoicing policy pointer | OPTIONAL
● Promotions/coupons | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- **type: business_rules_policy**
- **template_version: 1.0.0**
- **output_path: 10_app/policy/BRP-03_Pricing_Permission_Policy.md**
- **compliance_gate_id: TMP-05.PRIMARY.POLICY**
- **upstream_dependencies: ["BRP-02"]**
- **inputs_required: ["BRP-02", "PRD-04", "STANDARDS_INDEX"]**
- **required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}**
- **Purpose**
- **Capture policy rules that govern pricing, billing permissions, and paywall behavior (if the product**
- **has monetization). This informs PAY/REVOPS, UI gating, and entitlements enforcement.**
- **Inputs Required**
- 
- 
- 
- 
- **BRP-02: {{xref:BRP-02}} | OPTIONAL**
- **PRD-04: {{xref:PRD-04}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **Pricing notes: {{inputs.pricing_notes}} | OPTIONAL**
- **Required Fields**
- 
- 
- 
- 
- 
- 
- **Policy applicability (true/false) (if false, explicitly mark N/A)**
- **Pricing constructs (plans, tiers, add-ons)**
- **Permission rules for billing actions (who can purchase/cancel/refund)**
- **Paywall rules (what happens when not entitled)**
- **Upgrade/downgrade rules (effective timing)**
- **Proration/refund policy pointer (if applicable)**
- **Optional Fields**
- Taxes/invoicing policy pointer | OPTIONAL
- Promotions/coupons | OPTIONAL
- Open questions | OPTIONAL
- **Rules**
- If applicable == false, include only: rationale + references, and mark remaining sections
- **00_NA.**
- Paywall behavior must map to entitlements from BRP-02.
- Billing permissions must map to roles from PRD-03/IAM.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Pricing Constructs (if applies)`
3. `## plan_i`
4. `## name`
5. `## plan_0`
6. `## included_entitlement_i`
7. `## limits`
8. `## notes`
9. `## 3) Billing Permissions (if applies)`
10. `## action`

## 8. Cross-References

- Upstream: {{xref:BRP-02}} | OPTIONAL
- Downstream: {{xref:REVOPS-}} | OPTIONAL, {{xref:PAY-}} | OPTIONAL, {{xref:FE-*}} |
- **OPTIONAL, {{xref:QA-02}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
