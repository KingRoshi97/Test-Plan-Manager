# DES-04 — Screen Layout Specs

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-04                                             |
| Template Type     | Experience Design                                  |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with defined UI screens                |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, DES-01, DES-02, DES-03             |
| Produces          | Filled Screen Layout Specifications                |

## 2. Purpose

Define the layout specification for each screen in the product, including component placement, content zones, responsive breakpoints, and interaction regions. Each screen spec maps to navigation model entries and workflow steps, providing the detailed design blueprint for implementation.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- DES-01 Design Language
- DES-02 Global Component Styles
- DES-03 Navigation Model

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Screen ID            | spec         | No              |
| Screen Name          | spec         | No              |
| Layout Structure     | spec         | No              |
| Component Placement  | spec         | Yes             |
| Content Zones        | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Responsive Breakpoints | spec       | If responsive design required  |
| Loading States       | spec         | Skeleton/placeholder patterns  |
| Error States         | spec         | Screen-level error display     |

## 6. Rules

- **No duplicate truth**: Screen IDs must match DES-03 screen list entries.
- **No invention**: Layout decisions must derive from spec or design language.
- **Consistency**: Components must reference DES-02 global styles.
- **Accessibility**: Layout must support keyboard navigation and screen readers.

## 7. Output Format

### Required Headings (in order)

1. `## Screen Index`
   - Table: Screen ID | Name | Route | Workflow Refs
2. `## Screen Specifications`
   - Per screen subsection:
     - `### <Screen ID>: <Name>`
     - Layout Structure
     - Component Placement
     - Content Zones
     - States (loading, empty, error, populated)
3. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: DES-01 (Design Language), DES-02 (Component Styles), DES-03 (Navigation Model)
- **Downstream**: DES-05 (States & Motion), Screen Packs, Component Packs
- **Entity Types Referenced**: features, workflows, data entities

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Screen Index          | Required  | Required     | Required |
| Screen Specifications | Required  | Required     | Required |
| Responsive Breakpoints| Optional  | Optional     | Required |
| States                | Optional  | Required     | Required |
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
- [ ] All screen IDs resolve to DES-03 screen list entries
- [ ] No contradictions between screen layouts and component styles
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Components reference DES-02 global styles
