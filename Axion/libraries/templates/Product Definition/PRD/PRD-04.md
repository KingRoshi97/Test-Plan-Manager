# PRD-04 — Workflow Excerpts

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-04                                             |
| Template Type     | Product Definition                                 |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with user-facing or system workflows   |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Work Breakdown                     |
| Produces          | Filled Workflow Excerpts document                  |

## 2. Purpose

Document the key user and system workflows that the product must support. Each workflow excerpt describes the sequence of steps, actors involved, decision points, and expected outcomes. Workflows are extracted from the canonical spec and presented in a standardized format.

## 3. Inputs Required

- Canonical Spec (`{{spec.workflows[]}}`)
- Work Breakdown (`{{work.*}}`)
- Acceptance Map (`{{acceptance.*}}`)

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Workflow ID          | spec         | No              |
| Workflow Name        | spec         | No              |
| Actors               | spec         | No              |
| Steps                | spec         | No              |
| Trigger              | spec         | Yes             |
| Expected Outcome     | spec         | No              |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Error Paths          | spec         | Alternate/exception flows      |
| Decision Points      | spec         | Branching logic                |
| Related Features     | spec         | Cross-reference to PRD-03      |

## 6. Rules

- **No duplicate truth**: Workflow IDs must come from canonical spec.
- **No invention**: Steps must reflect spec content, not agent assumptions.
- **Completeness**: All workflows referenced by features in PRD-03 must appear here.
- **Actor consistency**: Actors must match roles defined in canonical spec.

## 7. Output Format

### Required Headings (in order)

1. `## Workflow Index`
   - Table: Workflow ID | Name | Actors | Feature Refs
2. `## Workflow Details`
   - Per workflow subsection:
     - `### <Workflow ID>: <Name>`
     - Trigger
     - Steps (numbered)
     - Expected Outcome
     - Error Paths (if applicable)
3. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: PRD-03 (Feature List), Canonical Spec (CAN-01)
- **Downstream**: DES-03 (Navigation Model), ARC-02 (Data Flow), Screen Packs
- **Entity Types Referenced**: workflows, roles, features

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Workflow Index        | Required  | Required     | Required |
| Workflow Details      | Required  | Required     | Required |
| Error Paths           | Optional  | Optional     | Required |
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
- [ ] All workflow IDs resolve to canonical spec entities
- [ ] No contradictions between workflows and feature list
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] All actors reference valid canonical role IDs
