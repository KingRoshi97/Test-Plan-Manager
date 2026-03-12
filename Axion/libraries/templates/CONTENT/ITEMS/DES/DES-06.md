# DES-06 — Form & Validation UX Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-06                                             |
| Template Type     | Design / UX                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring form & validation ux rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Form & Validation UX Rules Document                         |

## 2. Purpose

Define consistent UX rules for forms and validation across the product: when validation
happens, how errors are shown, how success is confirmed, and how accessibility is handled.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- DES-03: {{xref:DES-03}}
- BRP-01: {{xref:BRP-01}} | OPTIONAL
- CDX-02: {{xref:CDX-02}} | OPTIONAL
- CDX-04: {{xref:CDX-04}} | OPTIONAL
- A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Validation timing rule... | spec         | Yes             |
| Field error presentati... | spec         | Yes             |
| Required field marking... | spec         | Yes             |
| Cross-field validation... | spec         | Yes             |
| Server-side validation... | spec         | Yes             |
| Success confirmation r... | spec         | Yes             |
| Disabled/readonly fiel... | spec         | Yes             |
| Accessibility rules (f... | spec         | Yes             |
| Copy guidance pointers... | spec         | Yes             |

## 5. Optional Fields

● Form autosave rules | OPTIONAL
● Draft/recovery rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(field rules, feedback)**
- **Header Block**
- 
- 
- 
- 
- 
- 
- 
- 
- **template_id: DES-06**
- **title: Form & Validation UX Rules (field rules, feedback)**
- **type: design_ux**
- **template_version: 1.0.0**
- **output_path: 10_app/design/DES-06_Form_Validation_UX.md**
- **compliance_gate_id: TMP-05.PRIMARY.DESIGN**
- **upstream_dependencies: ["DES-03", "BRP-01"]**
- **inputs_required: ["DES-03", "BRP-01", "CDX-02", "CDX-04", "A11YD-05",**
- **"STANDARDS_INDEX"]**
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define consistent UX rules for forms and validation across the product: when validation**
- **happens, how errors are shown, how success is confirmed, and how accessibility is handled.**
- **Inputs Required**
- 
- 
- 
- 
- 
- 
- **DES-03: {{xref:DES-03}}**
- **BRP-01: {{xref:BRP-01}} | OPTIONAL**
- **CDX-02: {{xref:CDX-02}} | OPTIONAL**
- **CDX-04: {{xref:CDX-04}} | OPTIONAL**
- **A11YD-05: {{xref:A11YD-05}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **Required Fields**
- 
- 
- 
- 
- 
- 
- **Validation timing rules (on change/on blur/on submit)**
- **Field error presentation rules (inline, summary, toast)**
- **Required field marking rules**
- **Cross-field validation behavior**
- **Server-side validation error handling**
- **Success confirmation rules**
- Disabled/readonly field behavior
- Accessibility rules (focus management, announcements)
- Copy guidance pointers (error message source)
- **Optional Fields**
- Form autosave rules | OPTIONAL
- Draft/recovery rules | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- 
- 
- 
- 
- **Validation must be deterministic and consistent across screens.**
- **Errors must be actionable; no generic “invalid” without guidance.**
- If server validation fails, UI must map to field(s) when possible.
- **Copy should be referenced from CDX catalogs when available.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Validation Timing (required)`
2. `## 2) Error Presentation (required)`
3. `## 3) Required Fields (required)`
4. `## 4) Cross-field Validation (required)`
5. `## 5) Server-side Validation Errors (required)`
6. `## 6) Success Confirmation (required)`
7. `## 7) Accessibility Rules (required)`
8. `## 8) Copy Source (required)`

## 8. Cross-References

- Upstream: {{xref:DES-03}}, {{xref:BRP-01}} | OPTIONAL
- Downstream: {{xref:FORM-*}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL
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
