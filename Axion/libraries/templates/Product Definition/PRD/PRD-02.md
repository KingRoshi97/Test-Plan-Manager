# PRD-02 — Product Scope & Goals

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-02                                             |
| Template Type     | Product Definition                                 |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring scope definition             |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission                  |
| Produces          | Filled Product Scope & Goals document              |

## 2. Purpose

Define the boundaries of the product — what is in scope, what is explicitly out of scope, and what the measurable goals are. This document prevents scope creep and provides a clear reference for what the project will and will not deliver.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- Intake Submission (`{{submission_id}}`)
- PRD-01 Product Requirements Document

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| In-Scope Items       | spec         | No              |
| Out-of-Scope Items   | spec         | Yes             |
| Product Goals        | spec         | No              |
| Success Metrics      | acceptance   | No              |
| Delivery Boundaries  | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Phase Breakdown      | work         | If multi-phase delivery        |
| Risk Boundaries      | spec         | Must reference canonical IDs   |

## 6. Rules

- **No duplicate truth**: Scope items must reference canonical entity IDs.
- **No invention**: Out-of-scope items must be explicitly stated, not inferred.
- **Measurability**: Every goal must have at least one success metric.
- **Consistency**: In-scope items must align with PRD-01 functional requirements.

## 7. Output Format

### Required Headings (in order)

1. `## Product Goals`
   - Table: Goal ID | Description | Success Metric | Target
2. `## In-Scope`
   - Bulleted list with entity references
3. `## Out-of-Scope`
   - Bulleted list with rationale
4. `## Delivery Boundaries`
5. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: PRD-01 (Product Requirements), Canonical Spec (CAN-01)
- **Downstream**: PRD-03 (Feature List), ARC-01 (Architecture Overview)
- **Entity Types Referenced**: features, workflows

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Product Goals         | Required  | Required     | Required |
| In-Scope              | Required  | Required     | Required |
| Out-of-Scope          | Optional  | Required     | Required |
| Delivery Boundaries   | Optional  | Optional     | Required |
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
- [ ] All references resolve to valid canonical entity IDs
- [ ] No contradictions between in-scope and out-of-scope items
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Every goal has a measurable success metric
