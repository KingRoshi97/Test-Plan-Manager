# PRD-03 — Feature & Capability List

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-03                                             |
| Template Type     | Product Definition                                 |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with defined features                  |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Work Breakdown                     |
| Produces          | Filled Feature & Capability List                   |

## 2. Purpose

Enumerate all features and capabilities the product must deliver, organized by priority and domain. Each feature entry references canonical spec entities and maps to acceptance criteria. This document serves as the authoritative feature inventory.

## 3. Inputs Required

- Canonical Spec (`{{spec.features[]}}`)
- Work Breakdown (`{{work.units[]}}`)
- Acceptance Map (`{{acceptance.*}}`)

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Feature ID           | spec         | No              |
| Feature Name         | spec         | No              |
| Description          | spec         | No              |
| Priority             | spec         | No              |
| Domain               | spec         | Yes             |
| Acceptance Criteria  | acceptance   | No              |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Dependencies         | work         | Cross-feature dependencies     |
| Effort Estimate      | work         | Must not create new truth      |
| User Story Refs      | spec         | Reference canonical IDs        |

## 6. Rules

- **No duplicate truth**: Feature IDs must come from the canonical spec; no inventing new features here.
- **No invention**: If a feature cannot be traced to spec, it must be flagged as UNKNOWN.
- **Completeness**: Every feature in the canonical spec must appear in this list.
- **Traceability**: Each feature must reference at least one acceptance criterion.

## 7. Output Format

### Required Headings (in order)

1. `## Feature Inventory`
   - Table: Feature ID | Name | Description | Priority | Domain | Acceptance Ref
2. `## Capability Summary`
   - Grouped by domain
3. `## Dependencies`
   - Table: Feature ID | Depends On | Type
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: PRD-01 (Product Requirements), PRD-02 (Scope/Goals), Canonical Spec (CAN-01)
- **Downstream**: PRD-04 (Workflow Excerpts), ARC-04 (Service/Module Contract), Feature Packs
- **Entity Types Referenced**: features, workflows, data entities

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Feature Inventory     | Required  | Required     | Required |
| Capability Summary    | Optional  | Required     | Required |
| Dependencies          | Optional  | Optional     | Required |
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
- [ ] Every canonical spec feature is listed
- [ ] All references resolve to valid canonical entity IDs
- [ ] No contradictions within feature list
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Each feature maps to acceptance criteria
