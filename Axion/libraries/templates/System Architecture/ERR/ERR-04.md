# ERR-04 — UX Error Mapping Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ERR-04                                             |
| Template Type     | Architecture / Error Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring ux error mapping rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled UX Error Mapping Rules Document                         |

## 2. Purpose

Define deterministic rules for how each reason_code is presented in the UX: which surface is
used (inline/toast/banner/modal), what copy key is used, whether retry is offered, and what
accessibility requirements apply. This prevents inconsistent error UX across screens and
platforms.

## 3. Inputs Required

- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● DES-07: {{xref:DES-07}} | OPTIONAL
- ● CDX-04: {{xref:CDX-04}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}} | OPTIONAL
- ● A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Mapping table (minimum 30 reason_code mappings; justify if smaller)
● For each mapping:
○ reason_code
○ default_surface (inline/toast/banner/modal/fullscreen)
○ message_key or msg_id (from CDX-04)
○ user_guidance (short)
○ retry_allowed (true/false)
○ retry_action (what happens on retry) | OPTIONAL
○ escalation_action (contact support, report, etc.) | OPTIONAL
○ accessibility requirement (announce, focus move, etc.)
○ platform notes (web/mobile)
● Global rules:
○ precedence rules (if multiple errors occur)
○ field error handling rules
○ unknown reason_code fallback behavior

## 5. Optional Fields

● Screen-specific overrides | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(reason_code → DES/CDX surfaces)**
- **Header Block**
- template_id: ERR-04
- title: UX Error Mapping Rules (reason_code → DES/CDX surfaces)
- type: error_model_reason_codes
- template_version: 1.0.0
- output_path: 10_app/errors/ERR-04_UX_Error_Mapping_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.ERRORS
- upstream_dependencies: ["ERR-02", "DES-07", "CDX-04", "A11YD-05"]
- inputs_required: ["ERR-02", "DES-07", "CDX-04", "CDX-01", "A11YD-05",
- **"STANDARDS_INDEX"]**
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define deterministic rules for how each reason_code is presented in the UX: which surface is**
- **used (inline/toast/banner/modal), what copy key is used, whether retry is offered, and what**
- **accessibility requirements apply. This prevents inconsistent error UX across screens and**
- **platforms.**
- **Inputs Required**
- ERR-02: {{xref:ERR-02}} | OPTIONAL
- DES-07: {{xref:DES-07}} | OPTIONAL
- CDX-04: {{xref:CDX-04}} | OPTIONAL
- CDX-01: {{xref:CDX-01}} | OPTIONAL
- A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Mapping table (minimum 30 reason_code mappings; justify if smaller)
- For each mapping:
- **○ reason_code**
- **○ default_surface (inline/toast/banner/modal/fullscreen)**
- **○ message_key or msg_id (from CDX-04)**
- **○ user_guidance (short)**
- **○ retry_allowed (true/false)**
- **○ retry_action (what happens on retry) | OPTIONAL**
- **○ escalation_action (contact support, report, etc.) | OPTIONAL**
- **○ accessibility requirement (announce, focus move, etc.)**
- **○ platform notes (web/mobile)**
- Global rules:
- **○ precedence rules (if multiple errors occur)**
- **○ field error handling rules**
- **○ unknown reason_code fallback behavior**
- **Optional Fields**
- Screen-specific overrides | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Must align with DES-07 surface rules and A11YD-05 focus/announcement rules.
- Every mapped reason_code must exist in ERR-02 registry.
- Unknown reason_code must map to a safe generic message and correlation ID
- **guidance policy.**
- Field-level validation errors must use inline + focus rules.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Reason Code → UX Mapping (canonical)`
2. `## reason_`
3. `## code`
4. `## surfac`
5. `## cdx_m`
6. `## sg_id_`
7. `## or_key`
8. `## guidan`
9. `## retry`
10. `## _allo`

## 8. Cross-References

- Upstream: {{xref:ERR-02}} | OPTIONAL, {{xref:DES-07}} | OPTIONAL, {{xref:CDX-04}} |
- **OPTIONAL, {{xref:A11YD-05}} | OPTIONAL**
- Downstream: {{xref:FE-07}} | OPTIONAL, {{xref:MOB-*}} | OPTIONAL, {{xref:QA-02}} |
- OPTIONAL
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
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
