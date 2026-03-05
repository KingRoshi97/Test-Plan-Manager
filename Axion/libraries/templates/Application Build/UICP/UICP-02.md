# UICP-02 — Component Composition Rules (props, slots, variants)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-02                                             |
| Template Type     | Build / UI Composition                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring component composition rules (props, slots, variants)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Component Composition Rules (props, slots, variants) Document                         |

## 2. Purpose

Define the canonical rules for composing UI components: how props are passed, how
slots/children are used, how variants are selected, how to avoid prop drilling, and how
composition patterns enforce consistency across the UI. This template must be consistent with
component implementation specs and must not invent composition primitives not present in
upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- UICP-01 Page Composition Patterns: {{ui.page_patterns}} | OPTIONAL
- FE-02 Component Implementation Specs: {{fe.component_specs}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Props rules (required/... | spec         | Yes             |
| Slots/children rules (... | spec         | Yes             |
| Variant selection rule... | spec         | Yes             |
| State ownership rules ... | spec         | Yes             |
| Data dependency bounda... | spec         | Yes             |
| Styling boundaries (to... | spec         | Yes             |
| Event/callback pattern... | spec         | Yes             |
| Anti-patterns list (wh... | spec         | Yes             |
| Testing considerations... | spec         | Yes             |

## 5. Optional Fields

Performance notes (memoization) | OPTIONAL

Accessibility composition notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Component composition MUST not break a11y requirements.**
- **Variants MUST be selected deterministically (no “magic” branching).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Principles`
2. `## principles:`
3. `## Props Rules`
4. `## Slots / Children Rules`
5. `## Variant Selection`
6. `## State Ownership`
7. `## Data Dependency Boundaries`
8. `## Styling Boundaries`
9. `## Events / Callbacks`
10. `## Anti-Patterns`

## 8. Cross-References

- **Upstream: {{xref:UICP-01}} | OPTIONAL, {{xref:FE-02}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:UICP-03}}, {{xref:UICP-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-A11Y]}} | OPTIONAL

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
