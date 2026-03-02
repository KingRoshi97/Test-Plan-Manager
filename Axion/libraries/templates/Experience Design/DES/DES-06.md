# DES-06 — Accessibility Requirements

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-06                                             |
| Template Type     | Experience Design                                  |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with UI requiring accessibility compliance |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Standards Snapshot, DES-01          |
| Produces          | Filled Accessibility Requirements document         |

## 2. Purpose

Define the accessibility requirements for the product, covering WCAG compliance targets, assistive technology support, keyboard navigation, screen reader compatibility, color contrast rules, and focus management. This document ensures the product is usable by people with diverse abilities.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- Standards Snapshot (`{{standards.*}}`)
- DES-01 Design Language
- PRD-05 User Personas & Roles

## 4. Required Fields

| Field Name              | Source       | UNKNOWN Allowed |
|-------------------------|--------------|-----------------|
| WCAG Compliance Level   | standards    | No              |
| Keyboard Navigation     | standards    | No              |
| Screen Reader Support   | standards    | No              |
| Color Contrast Rules    | standards    | No              |
| Focus Management        | standards    | Yes             |

## 5. Optional Fields

| Field Name              | Source       | Notes                          |
|-------------------------|--------------|--------------------------------|
| ARIA Landmark Strategy  | standards    | If complex navigation          |
| Touch Target Sizes      | standards    | If mobile/touch supported      |
| Cognitive Load Rules    | standards    | If cognitive accessibility in scope |

## 6. Rules

- **No duplicate truth**: Accessibility rules must reference standards snapshot entries.
- **No invention**: Requirements must derive from standards or spec.
- **Testability**: Every requirement must be objectively verifiable.
- **Consistency**: Must not contradict DES-01 design tokens or DES-05 motion rules.

## 7. Output Format

### Required Headings (in order)

1. `## Compliance Target`
2. `## Keyboard Navigation Rules`
   - Table: Context | Behavior | Key Binding
3. `## Screen Reader Requirements`
4. `## Color & Contrast Rules`
   - Table: Element Type | Min Contrast Ratio | Standard Ref
5. `## Focus Management`
6. `## Testing Requirements`
7. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: DES-01 (Design Language), Standards Snapshot (STD-03), PRD-05 (User Personas)
- **Downstream**: Quality/QA templates, Component Packs
- **Entity Types Referenced**: roles, features

## 9. Skill Level Requiredness Rules

| Section                  | Beginner  | Intermediate | Expert   |
|--------------------------|-----------|--------------|----------|
| Compliance Target        | Required  | Required     | Required |
| Keyboard Navigation      | Optional  | Required     | Required |
| Screen Reader Requirements | Optional | Required     | Required |
| Color & Contrast Rules   | Required  | Required     | Required |
| Focus Management         | Optional  | Optional     | Required |
| Testing Requirements     | Optional  | Required     | Required |
| Unknowns                 | Optional  | Required     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

Unknowns in this template must map back to Canonical Spec unknown objects (CAN-03).

## 11. Completeness Gate

- [ ] All required fields are populated
- [ ] All accessibility rules reference standards snapshot entries
- [ ] No contradictions between a11y requirements and design tokens
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Every requirement is objectively testable
