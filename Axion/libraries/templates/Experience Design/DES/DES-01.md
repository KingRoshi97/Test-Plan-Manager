# DES-01 — Design Language & Theme Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-01                                             |
| Template Type     | Experience Design                                  |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with UI/visual design requirements     |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Standards Snapshot                 |
| Produces          | Filled Design Language & Theme Specification       |

## 2. Purpose

Define the visual design language and theming rules for the product, including color palette, typography, spacing system, iconography, and brand expression. This document establishes the foundational design tokens and rules that all downstream design and component templates must follow.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- Standards Snapshot (`{{standards.*}}`)
- Intake Submission (`{{submission_id}}`)

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Color Palette        | spec         | Yes             |
| Typography Scale     | spec         | Yes             |
| Spacing System       | spec         | Yes             |
| Brand Expression     | spec         | Yes             |
| Theme Mode Support   | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Iconography Style    | spec         | If icon set is specified       |
| Motion Principles    | spec         | High-level animation rules     |
| Illustration Style   | spec         | If illustrations are in scope  |

## 6. Rules

- **No duplicate truth**: Design tokens must reference canonical spec entities.
- **No invention**: Visual properties must derive from spec or be marked UNKNOWN.
- **Consistency**: All tokens must be usable across all supported theme modes.
- **Standards compliance**: Color contrast must meet accessibility standards from the standards snapshot.

## 7. Output Format

### Required Headings (in order)

1. `## Design Tokens`
   - `### Color Palette`
   - `### Typography Scale`
   - `### Spacing System`
2. `## Brand Expression`
3. `## Theme Modes`
4. `## Accessibility Constraints`
5. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: PRD-01 (Product Requirements), Canonical Spec (CAN-01), Standards Snapshot (STD-03)
- **Downstream**: DES-02 (Global Component Styles), DES-04 (Screen Layout Specs), Component Packs
- **Entity Types Referenced**: features, data entities

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Design Tokens              | Required  | Required     | Required |
| Brand Expression           | Optional  | Required     | Required |
| Theme Modes                | Optional  | Optional     | Required |
| Accessibility Constraints  | Optional  | Required     | Required |
| Unknowns                   | Optional  | Required     | Required |

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

- [ ] All required fields are populated or explicitly UNKNOWN
- [ ] All references resolve to valid canonical entity IDs
- [ ] No contradictions between design tokens and accessibility standards
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Color contrast meets standards snapshot accessibility rules
