# DES-05 — States & Motion

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-05                                             |
| Template Type     | Experience Design                                  |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with interactive UI states or animation |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, DES-01, DES-04                     |
| Produces          | Filled States & Motion specification               |

## 2. Purpose

Define the interactive states, transitions, and motion design for the product. This document covers loading states, error states, empty states, transition animations, micro-interactions, and feedback patterns. It ensures consistent, purposeful motion across all screens and components.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- DES-01 Design Language
- DES-04 Screen Layout Specs

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| State Definitions    | spec         | No              |
| Transition Rules     | spec         | Yes             |
| Motion Principles    | spec         | Yes             |
| Feedback Patterns    | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Animation Timing     | spec         | Easing curves, durations       |
| Reduced Motion Rules | standards    | Accessibility preference       |
| Gesture Responses    | spec         | If touch/gesture input         |

## 6. Rules

- **No duplicate truth**: State definitions must reference screen IDs from DES-04.
- **No invention**: Motion patterns must derive from spec or design language principles.
- **Accessibility**: Must support reduced motion preferences per standards.
- **Performance**: Animations must not degrade perceived performance.

## 7. Output Format

### Required Headings (in order)

1. `## State Catalog`
   - Table: State Type | Description | Applies To | Trigger
2. `## Transition Rules`
   - Table: From State | To State | Animation | Duration
3. `## Motion Principles`
4. `## Feedback Patterns`
5. `## Accessibility Motion Rules`
6. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: DES-01 (Design Language), DES-04 (Screen Layout Specs)
- **Downstream**: Component Packs, Implementation templates
- **Entity Types Referenced**: features, workflows

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| State Catalog              | Required  | Required     | Required |
| Transition Rules           | Optional  | Required     | Required |
| Motion Principles          | Optional  | Optional     | Required |
| Feedback Patterns          | Optional  | Required     | Required |
| Accessibility Motion Rules | Optional  | Required     | Required |
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

- [ ] All required fields are populated
- [ ] All state references resolve to DES-04 screen entries
- [ ] No contradictions between motion rules and accessibility standards
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Reduced motion preferences are addressed
