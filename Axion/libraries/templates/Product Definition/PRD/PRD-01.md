# PRD-01 — Product Requirements Document

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-01                                             |
| Template Type     | Product Definition                                 |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring a product requirements doc  |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Product Requirements Document               |

## 2. Purpose

Define the complete product requirements for the project, consolidating business objectives, user needs, functional requirements, and constraints into a single authoritative document. This serves as the root product-level specification that all downstream design, architecture, and implementation documents reference.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- Intake Submission (`{{submission_id}}`)
- Resolved Standards Snapshot (`{{standards.*}}`)
- Acceptance Map (`{{acceptance.*}}`)

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Product Name              | spec         | No              |
| Product Purpose           | spec         | No              |
| Target Users              | spec         | No              |
| Functional Requirements   | spec         | No              |
| Non-Functional Requirements | standards  | No              |
| Success Criteria          | acceptance   | No              |
| Constraints               | spec         | Yes             |
| Assumptions               | spec         | Yes             |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Market Context            | spec         | Enrichment only, no new truth  |
| Competitive References    | spec         | Must reference canonical IDs   |
| Revision History          | spec         | Auto-populated from version stamps |

## 6. Rules

- **No duplicate truth**: All requirements must reference canonical entity IDs from the spec; no redefining features, roles, or workflows.
- **No invention**: If a requirement cannot be derived from spec or standards, mark as UNKNOWN or block progression.
- **Traceability**: Every functional requirement must map to at least one acceptance criterion in the Acceptance Map.
- **Completeness**: All sections must be populated or explicitly marked N/A with justification.

## 7. Output Format

### Required Headings (in order)

1. `## Product Overview`
2. `## Target Users & Personas`
3. `## Functional Requirements`
   - Table: Requirement ID | Description | Priority | Source Entity | Acceptance Criteria Ref
4. `## Non-Functional Requirements`
   - Table: Category | Requirement | Standard Ref
5. `## Constraints & Assumptions`
6. `## Success Criteria`
7. `## Dependencies`
8. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: Canonical Spec (CAN-01), Intake Submission (INT-01), Standards Snapshot (STD-03)
- **Downstream**: PRD-02 (Scope/Goals), PRD-03 (Feature List), DES-01 (Design Language), ARC-01 (Architecture Overview)
- **Entity Types Referenced**: roles, features, workflows, data entities

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Product Overview           | Required  | Required     | Required |
| Target Users & Personas    | Required  | Required     | Required |
| Functional Requirements    | Required  | Required     | Required |
| Non-Functional Requirements| Optional  | Required     | Required |
| Constraints & Assumptions  | Optional  | Required     | Required |
| Success Criteria           | Required  | Required     | Required |
| Dependencies               | Optional  | Optional     | Required |
| Unknowns & Open Questions  | Optional  | Required     | Required |

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
- [ ] No contradictions between requirements and constraints
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Functional requirements map to acceptance criteria
- [ ] Non-functional requirements reference standards snapshot entries
