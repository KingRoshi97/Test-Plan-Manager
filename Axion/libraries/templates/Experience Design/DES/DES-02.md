# DES-02 — Global Component Styles

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-02                                             |
| Template Type     | Experience Design                                  |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with reusable UI components            |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, DES-01 Design Language             |
| Produces          | Filled Global Component Styles document            |

## 2. Purpose

Define the global styling rules for reusable UI components — buttons, inputs, cards, modals, navigation elements, and other shared primitives. These styles consume design tokens from DES-01 and ensure visual consistency across all screens and features.

## 3. Inputs Required

- DES-01 Design Language (`{{spec.*}}`)
- Standards Snapshot (`{{standards.*}}`)
- Canonical Spec (`{{spec.*}}`)

## 4. Required Fields

| Field Name              | Source       | UNKNOWN Allowed |
|-------------------------|--------------|-----------------|
| Component List          | spec         | No              |
| Style Rules per Component | spec       | Yes             |
| State Variants          | spec         | Yes             |
| Responsive Behavior     | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Animation Rules      | spec         | Per-component motion           |
| Dark Mode Overrides  | spec         | If theme modes defined         |

## 6. Rules

- **No duplicate truth**: Component styles must reference DES-01 tokens, not redefine values.
- **No invention**: Style rules must derive from spec or design language.
- **Consistency**: All components must follow the same spacing and typography rules.
- **Accessibility**: Interactive components must meet focus, contrast, and touch-target standards.

## 7. Output Format

### Required Headings (in order)

1. `## Component Inventory`
   - Table: Component Name | Category | States | Responsive
2. `## Style Definitions`
   - Per component subsection:
     - `### <Component Name>`
     - Default State
     - Interactive States (hover, focus, active, disabled)
     - Responsive Rules
3. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: DES-01 (Design Language), Canonical Spec (CAN-01)
- **Downstream**: DES-04 (Screen Layout Specs), Component Packs
- **Entity Types Referenced**: features, data entities

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Component Inventory   | Required  | Required     | Required |
| Style Definitions     | Optional  | Required     | Required |
| State Variants        | Optional  | Required     | Required |
| Unknowns              | Optional  | Required     | Required |

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
- [ ] All style rules reference DES-01 design tokens
- [ ] No contradictions between component styles
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Interactive components meet accessibility standards
