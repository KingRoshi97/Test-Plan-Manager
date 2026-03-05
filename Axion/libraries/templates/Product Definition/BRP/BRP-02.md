# BRP-02 — Eligibility & Entitlement Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | BRP-02                                             |
| Template Type     | Product / Business Rules                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring eligibility & entitlement rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Eligibility & Entitlement Rules Document                         |

## 2. Purpose

Specify who is eligible for what and what entitlements they receive (features, limits,
permissions). This is the canonical source for gating capabilities (often used by IAM,
PAY/REVOPS, and UI/UX).

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- BRP-01: {{xref:BRP-01}}
- PRD-03: {{xref:PRD-03}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Plan/tier notes: {{inputs.tier_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Eligibility criteria l... | spec         | Yes             |
| Entitlement catalog (m... | spec         | Yes             |
| Mapping matrix:           | spec         | Yes             |
| ○ role/persona/tier → ... | spec         | Yes             |
| For each eligibility r... | spec         | Yes             |
| ○ elig_id                 | spec         | Yes             |
| ○ statement               | spec         | Yes             |
| ○ evaluated_inputs        | spec         | Yes             |
| ○ decision_output (eli... | spec         | Yes             |
| ○ enforcement_points      | spec         | Yes             |
| ○ exceptions              | spec         | Yes             |
| For each entitlement:     | spec         | Yes             |

## 5. Optional Fields

● Trial rules | OPTIONAL
● Grace periods | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- **Header Block**
- 
- 
- 
- 
- 
- 
- 
- 
- 
- **template_id: BRP-02**
- **title: Eligibility & Entitlement Rules**
- **type: business_rules_policy**
- **template_version: 1.0.0**
- **output_path: 10_app/policy/BRP-02_Eligibility_Entitlements.md**
- **compliance_gate_id: TMP-05.PRIMARY.POLICY**
- **upstream_dependencies: ["BRP-01", "PRD-03"]**
- **inputs_required: ["BRP-01", "PRD-03", "PRD-04", "STANDARDS_INDEX"]**
- **required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}**
- **Purpose**
- **Specify who is eligible for what and what entitlements they receive (features, limits,**
- **permissions). This is the canonical source for gating capabilities (often used by IAM,**
- **PAY/REVOPS, and UI/UX).**
- **Inputs Required**
- 
- 
- 
- 
- 
- **BRP-01: {{xref:BRP-01}}**
- **PRD-03: {{xref:PRD-03}} | OPTIONAL**
- **PRD-04: {{xref:PRD-04}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **Plan/tier notes: {{inputs.tier_notes}} | OPTIONAL**
- **Required Fields**
- Eligibility criteria list (minimum 5)
- Entitlement catalog (minimum 10 entitlements)
- Mapping matrix:
- **○ role/persona/tier → entitlements**
- For each eligibility rule:
- **○ elig_id**
- **○ statement**
- **○ evaluated_inputs**
- **○ decision_output (eligible/ineligible + reason)**
- **○ enforcement_points**
- **○ exceptions**
- For each entitlement:
- **○ ent_id**
- **○ entitlement_name**
- **○ description**
- **○ scope (feature/limit/permission)**
- **○ related_feature_ids**
- **○ limit_value (if applicable)**
- **○ enforcement_points**
- **○ audit_event (if applicable)**
- **Optional Fields**
- Trial rules | OPTIONAL
- Grace periods | OPTIONAL
- Open questions | OPTIONAL
- **Rules**
- Any eligibility/entitlement must be enforceable at API level (even if also enforced in UI).
- If tiers exist, entitlements must be deterministic by tier.
- Limit entitlements must declare units (e.g., per day, per month, per org).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Eligibility Rules (canonical)`
2. `## elig`
3. `## _id`
4. `## statement`
5. `## evaluated`
6. `## _inputs`
7. `## output`
8. `## enforcement_`
9. `## points`
10. `## exceptions`

## 8. Cross-References

- Upstream: {{xref:BRP-01}}, {{xref:PRD-03}} | OPTIONAL
- Downstream: {{xref:IAM-03}} | OPTIONAL, {{xref:REVOPS-01}} | OPTIONAL,
- **{{xref:API-04}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL**
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
