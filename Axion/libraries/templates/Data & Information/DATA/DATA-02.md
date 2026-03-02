# DATA-02 — Entity Excerpt

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-02                                            |
| Template Type     | Data & Information                                 |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with defined data entities             |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Standards Snapshot                 |
| Produces          | Filled Entity Excerpt document                     |

## 2. Purpose

Document the data entity definitions for the product, including entity attributes, relationships, constraints, and validation rules. Each entity excerpt is derived from the canonical spec and provides the authoritative reference for data modeling, API design, and storage implementation.

## 3. Inputs Required

- Canonical Spec (`{{spec.data_entities[]}}`)
- Standards Snapshot (`{{standards.*}}`)
- ARC-02 Data Flow Diagrams

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Entity ID            | spec         | No              |
| Entity Name          | spec         | No              |
| Attributes           | spec         | No              |
| Primary Key          | spec         | No              |
| Relationships        | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Validation Rules     | spec         | Field-level constraints        |
| Indexes              | spec         | Performance optimization       |
| Audit Fields         | standards    | If audit trail required        |
| Soft Delete Rules    | spec         | If soft delete pattern used    |

## 6. Rules

- **No duplicate truth**: Entity IDs must come from the canonical spec.
- **No invention**: Attributes must derive from spec; no agent-invented fields.
- **Referential integrity**: Relationships must reference valid entity IDs.
- **Completeness**: All entities referenced by features must have an excerpt.

## 7. Output Format

### Required Headings (in order)

1. `## Entity Index`
   - Table: Entity ID | Name | Description | Feature Refs
2. `## Entity Definitions`
   - Per entity subsection:
     - `### <Entity ID>: <Name>`
     - Attributes table: Field | Type | Required | Description | Constraints
     - Primary Key
     - Relationships table: Relationship | Target Entity | Cardinality | Description
     - Validation Rules
3. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: Canonical Spec (CAN-01), ARC-02 (Data Flow), PRD-03 (Feature List)
- **Downstream**: ARC-04 (Service Contract), API templates, Implementation templates
- **Entity Types Referenced**: data entities, features

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Entity Index          | Required  | Required     | Required |
| Entity Definitions    | Required  | Required     | Required |
| Validation Rules      | Optional  | Required     | Required |
| Relationships         | Optional  | Required     | Required |
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
- [ ] All entity IDs resolve to canonical spec entities
- [ ] No contradictions between entity definitions and data flows
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Referential integrity is maintained across relationships
