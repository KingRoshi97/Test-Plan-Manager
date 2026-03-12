# BRP-01 — Business Rules Catalog (by ID)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | BRP-01                                             |
| Template Type     | Product / Business Rules                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring business rules catalog (by id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Business Rules Catalog (by ID) Document                         |

## 2. Purpose

Define the canonical, testable business rules that govern system behavior. These rules are
referenced by API authorization, data constraints, UI validation, and test cases. This is the “rule
source,” not the implementation.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- DMG-01: {{xref:DMG-01}} | OPTIONAL
- DMG-03: {{xref:DMG-03}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing policy notes: {{inputs.policy_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Rule list (minimum 15 ... | spec         | Yes             |
| For each rule:            | spec         | Yes             |
| ○ br_id                   | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ rule_statement (must... | spec         | Yes             |
| ○ scope (system/featur... | spec         | Yes             |
| ○ related_feature_ids     | spec         | Yes             |
| ○ related_entity_ids      | spec         | Yes             |
| inputs (what the rule ... | spec         | Yes             |
| outputs/effects (what ... | spec         | Yes             |
| exceptions (if any)       | spec         | Yes             |
| enforcement_points (UI... | spec         | Yes             |

## 5. Optional Fields

● Source references (policy docs) | OPTIONAL
● Versioning notes | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- **BRP-03 Pricing/Permission Policy Rules (if applicable)**
- **BRP-04 Exceptions & Edge-Case Policy**
- **BRP-01**
- **BRP-01 — Business Rules Catalog (by ID)**
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
- **template_id: BRP-01**
- **title: Business Rules Catalog (by ID)**
- **type: business_rules_policy**
- **template_version: 1.0.0**
- **output_path: 10_app/policy/BRP-01_Business_Rules_Catalog.md**
- **compliance_gate_id: TMP-05.PRIMARY.POLICY**
- **upstream_dependencies: ["PRD-04", "DMG-01", "DMG-03"]**
- **inputs_required: ["PRD-04", "DMG-01", "DMG-03", "STANDARDS_INDEX"]**
- **required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}**
- **Purpose**
- **Define the canonical, testable business rules that govern system behavior. These rules are**
- **referenced by API authorization, data constraints, UI validation, and test cases. This is the “rule**
- **source,” not the implementation.**
- **Inputs Required**
- 
- 
- 
- 
- 
- **PRD-04: {{xref:PRD-04}} | OPTIONAL**
- **DMG-01: {{xref:DMG-01}} | OPTIONAL**
- **DMG-03: {{xref:DMG-03}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **Existing policy notes: {{inputs.policy_notes}} | OPTIONAL**
- **Required Fields**
- Rule list (minimum 15 for non-trivial products)
- For each rule:
- **○ br_id**
- **○ name**
- **○ rule_statement (must/never/only if)**
- **○ category (eligibility/entitlement/pricing/limits/workflow/data)**
- **○ scope (system/feature/entity/endpoint)**
- **○ related_feature_ids**
- **○ related_entity_ids**
- **○**
- **○**
- **○**
- **○**
- **○**
- **○**
- **○**
- **inputs (what the rule evaluates)**
- **outputs/effects (what changes)**
- **exceptions (if any)**
- **enforcement_points (UI/API/DB/ops)**
- **testability_notes (how to verify)**
- **priority (P0/P1/P2)**
- **status (active/deprecated)**
- **Optional Fields**
- Source references (policy docs) | OPTIONAL
- Versioning notes | OPTIONAL
- Open questions | OPTIONAL
- **Rules**
- Rules must be testable; vague language must be converted into measurable conditions.
- Rule IDs must be stable and unique (br_<slug>).
- If a rule is “hard” (P0), it must declare at least one enforcement_point and
- **testability_notes.**
- If a rule conflicts with another rule or invariant, escalate to STK-02.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Business Rules Catalog (canonical)`
2. `## b na`
3. `## r me`
4. `## cate`
5. `## gor`
6. `## rule`
7. `## _sta`
8. `## tem`
9. `## ent`
10. `## feat`

## 8. Cross-References

- Upstream: {{xref:PRD-04}} | OPTIONAL, {{xref:DMG-03}} | OPTIONAL
- Downstream: {{xref:API-02}} | OPTIONAL, {{xref:DATA-03}} | OPTIONAL, {{xref:QA-02}}
- **| OPTIONAL, {{xref:IAM-03}} | OPTIONAL**
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
