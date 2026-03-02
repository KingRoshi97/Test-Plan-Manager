# PRD-06 — Business Rules & Constraints

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-06                                             |
| Template Type     | Product Definition                                 |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with business logic or constraints     |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Standards Snapshot                 |
| Produces          | Filled Business Rules & Constraints document       |

## 2. Purpose

Capture all business rules, validation logic, domain constraints, and invariants that govern product behavior. These rules are extracted from the canonical spec and standards, and serve as the authoritative reference for implementation correctness.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- Standards Snapshot (`{{standards.*}}`)
- Acceptance Map (`{{acceptance.*}}`)

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Rule ID              | spec         | No              |
| Rule Description     | spec         | No              |
| Applies To           | spec         | No              |
| Enforcement          | standards    | Yes             |
| Validation Criteria  | acceptance   | No              |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Exception Cases      | spec         | Edge cases and overrides       |
| Priority             | spec         | Business criticality           |
| Regulatory Refs      | standards    | External compliance refs       |

## 6. Rules

- **No duplicate truth**: Rule IDs must reference canonical spec entities.
- **No invention**: Business rules must derive from spec or standards, not agent assumptions.
- **Testability**: Every rule must have a validation criterion that can be objectively checked.
- **Consistency**: Rules must not contradict each other or conflict with standards.

## 7. Output Format

### Required Headings (in order)

1. `## Business Rules Index`
   - Table: Rule ID | Description | Applies To | Enforcement | Priority
2. `## Rule Details`
   - Per rule subsection:
     - `### <Rule ID>: <Description>`
     - Applies To
     - Enforcement Logic
     - Validation Criteria
     - Exceptions
3. `## Constraints Summary`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: PRD-01 (Product Requirements), Canonical Spec (CAN-01), Standards Snapshot (STD-03)
- **Downstream**: ARC-04 (Service/Module Contract), Implementation templates
- **Entity Types Referenced**: features, data entities, workflows

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Business Rules Index  | Required  | Required     | Required |
| Rule Details          | Optional  | Required     | Required |
| Constraints Summary   | Optional  | Required     | Required |
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
- [ ] All rule IDs resolve to canonical spec entities
- [ ] No contradictions between rules
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Every rule has testable validation criteria
