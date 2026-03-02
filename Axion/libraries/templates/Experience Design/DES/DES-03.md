# DES-03 — Navigation Model & Site Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-03                                             |
| Template Type     | Experience Design                                  |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with multi-screen navigation           |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, PRD-04 Workflow Excerpts           |
| Produces          | Filled Navigation Model & Site Map document        |

## 2. Purpose

Define the navigation structure, information architecture, and routing model for the product. This document maps screens to workflows, defines navigation hierarchies, and establishes the spatial relationships between different parts of the application.

## 3. Inputs Required

- Canonical Spec (`{{spec.workflows[]}}`, `{{spec.features[]}}`)
- PRD-04 Workflow Excerpts
- PRD-05 User Personas & Roles

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Navigation Hierarchy | spec         | No              |
| Screen List          | spec         | No              |
| Route Definitions    | spec         | Yes             |
| Role-Based Access    | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Deep Link Rules      | spec         | If deep linking is supported   |
| Breadcrumb Logic     | spec         | Navigation aid rules           |
| Search Navigation    | spec         | If global search is in scope   |

## 6. Rules

- **No duplicate truth**: Screen IDs must reference canonical spec entities.
- **No invention**: Navigation paths must reflect defined workflows.
- **Completeness**: Every workflow must have a navigable path through the screen list.
- **Consistency**: Role-based access must align with PRD-05 role definitions.

## 7. Output Format

### Required Headings (in order)

1. `## Navigation Hierarchy`
   - Tree structure of screen groups
2. `## Screen List`
   - Table: Screen ID | Name | Route | Parent | Access Roles
3. `## Navigation Flows`
   - Per workflow navigation path
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: PRD-04 (Workflow Excerpts), PRD-05 (User Personas), Canonical Spec (CAN-01)
- **Downstream**: DES-04 (Screen Layout Specs), Screen Packs
- **Entity Types Referenced**: workflows, roles, features

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Navigation Hierarchy  | Required  | Required     | Required |
| Screen List           | Required  | Required     | Required |
| Navigation Flows      | Optional  | Required     | Required |
| Role-Based Access     | Optional  | Optional     | Required |
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
- [ ] All screen IDs resolve to canonical spec entities
- [ ] No contradictions between navigation model and workflows
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Every workflow has a navigable path
