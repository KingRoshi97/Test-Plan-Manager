# PRD-05 — User Personas & Role Requirements

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-05                                             |
| Template Type     | Product Definition                                 |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with defined user roles                |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission                  |
| Produces          | Filled User Personas & Role Requirements document  |

## 2. Purpose

Define the user personas and role-based requirements for the product. Each persona maps to canonical roles and specifies access levels, capabilities, and constraints. This document ensures design and implementation decisions are grounded in defined user types.

## 3. Inputs Required

- Canonical Spec (`{{spec.roles[]}}`)
- Intake Submission (`{{submission_id}}`)
- Standards Snapshot (`{{standards.*}}`)

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Role ID              | spec         | No              |
| Role Name            | spec         | No              |
| Description          | spec         | No              |
| Permissions          | spec         | Yes             |
| Access Level         | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Persona Narrative    | spec         | Enrichment only                |
| Usage Frequency      | spec         | Contextual detail              |
| Technical Proficiency| spec         | Informs UX complexity          |

## 6. Rules

- **No duplicate truth**: Role IDs must match canonical spec entity IDs.
- **No invention**: Permissions and access levels must derive from spec or standards.
- **Completeness**: Every role in the canonical spec must be represented.
- **Consistency**: Permissions must not contradict security requirements.

## 7. Output Format

### Required Headings (in order)

1. `## Roles Index`
   - Table: Role ID | Name | Access Level | Primary Workflows
2. `## Persona Details`
   - Per role subsection:
     - `### <Role ID>: <Name>`
     - Description
     - Permissions
     - Workflows
     - Constraints
3. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: PRD-01 (Product Requirements), Canonical Spec (CAN-01)
- **Downstream**: PRD-04 (Workflow Excerpts), DES-06 (A11y Requirements), Security templates
- **Entity Types Referenced**: roles, features, workflows

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Roles Index           | Required  | Required     | Required |
| Persona Details       | Optional  | Required     | Required |
| Permissions           | Optional  | Required     | Required |
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
- [ ] All role IDs resolve to canonical spec entities
- [ ] No contradictions between roles and security requirements
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Every canonical role is represented
