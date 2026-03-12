# IAN-05 — Access-Gated Navigation Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAN-05                                             |
| Template Type     | Design / Information Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring access-gated navigation rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Access-Gated Navigation Rules Document                         |

## 2. Purpose

Define deterministic rules for how navigation behaves when access is restricted: what is hidden
vs disabled, how upsells or explanations are shown, and what happens if a user deep-links into
restricted content. This prevents inconsistent access handling across the product.

## 3. Inputs Required

- ● IAN-01: {{xref:IAN-01}} | OPTIONAL
- ● PRD-03: {{xref:PRD-03}} | OPTIONAL
- ● BRP-02: {{xref:BRP-02}} | OPTIONAL
- ● IAM-03: {{xref:IAM-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Access gating display ... | spec         | Yes             |
| ○ hide                    | spec         | Yes             |
| ○ disable (show but in... | spec         | Yes             |
| ○ show-with-upsell (if... | spec         | Yes             |
| ○ show-with-request-ac... | spec         | Yes             |
| ○ primary nav             | spec         | Yes             |
| ○ secondary nav           | spec         | Yes             |
| ○ contextual links        | spec         | Yes             |
| ○ deep links              | spec         | Yes             |
| Deep link restricted b... | spec         | Yes             |
| ○ redirect target         | spec         | Yes             |
| ○ explanation UI          | spec         | Yes             |

## 5. Optional Fields

● Org-level policies (enterprise access) | OPTIONAL
● Audit trail needs | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(role-based visibility)**
- **Header Block**
- template_id: IAN-05
- title: Access-Gated Navigation Rules (role-based visibility)
- type: information_architecture_navigation
- template_version: 1.0.0
- output_path: 10_app/ia/IAN-05_Access_Gated_Navigation_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.IAN
- upstream_dependencies: ["IAN-01", "PRD-03", "BRP-02", "IAM-03"]
- inputs_required: ["IAN-01", "PRD-03", "BRP-02", "IAM-03", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define deterministic rules for how navigation behaves when access is restricted: what is hidden**
- **vs disabled, how upsells or explanations are shown, and what happens if a user deep-links into**
- **restricted content. This prevents inconsistent access handling across the product.**
- **Inputs Required**
- IAN-01: {{xref:IAN-01}} | OPTIONAL
- PRD-03: {{xref:PRD-03}} | OPTIONAL
- BRP-02: {{xref:BRP-02}} | OPTIONAL
- IAM-03: {{xref:IAM-03}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Access gating display modes:
- **○ hide**
- **○ disable (show but inactive)**
- **○ show-with-upsell (if monetized)**
- **○ show-with-request-access (if applicable)**
- Deterministic rule table for which mode applies by nav surface type:
- **○ primary nav**
- **○ secondary nav**
- **○ contextual links**
- **○ deep links**
- Deep link restricted behavior:
- **○ redirect target**
- **○ explanation UI**
- **○ logging/telemetry requirement**
- Copy requirements pointer (CDX) for access messages
- Security requirement: avoid leaking details of restricted resources
- **Optional Fields**
- Org-level policies (enterprise access) | OPTIONAL
- Audit trail needs | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Must not invent roles or entitlements; use PRD-03/BRP-02/IAM.
- Deep links must be safe by default: no partial rendering of restricted data.
- If showing disabled items, there must be an accessible explanation (tooltip/help text) and
- **a deterministic action if any (upgrade/request).**
- If upsell exists, it must be consistent with pricing policy (BRP-03 / REVOPS).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Gating Modes (required)`
2. `## mode`
3. `## description`
4. `## user_experienc`
5. `## hide`
6. `## c}}`
7. `## s}}`
8. `## disable`
9. `## esc}}`
10. `## ux}}`

## 8. Cross-References

- Upstream: {{xref:IAN-01}} | OPTIONAL, {{xref:PRD-03}} | OPTIONAL, {{xref:BRP-02}} |
- **OPTIONAL, {{xref:IAM-03}} | OPTIONAL**
- Downstream: {{xref:IAN-02}} | OPTIONAL, {{xref:FE-01}} | OPTIONAL, {{xref:MOB-01}} |
- **OPTIONAL, {{xref:QA-02}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
