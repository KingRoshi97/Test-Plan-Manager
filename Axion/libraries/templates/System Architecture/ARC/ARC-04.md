# ARC-04 — Service & Module Contract

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-04                                             |
| Template Type     | System Architecture                                |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with service or module boundaries      |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, ARC-01, ARC-02                     |
| Produces          | Filled Service & Module Contract document          |

## 2. Purpose

Define the contract for each service or module in the system, including its public API, dependencies, data ownership, error handling, and operational requirements. Each contract maps to a component in ARC-01 and features in PRD-03.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- ARC-01 System Architecture Overview
- ARC-02 Data Flow Diagrams
- PRD-03 Feature & Capability List

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Service/Module ID    | spec         | No              |
| Responsibility       | spec         | No              |
| Public API Surface   | spec         | No              |
| Dependencies         | spec         | Yes             |
| Data Ownership       | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Error Codes          | spec         | Service-specific error codes   |
| SLA/SLO Targets      | standards    | If defined in standards        |
| Circuit Breaker Rules| spec         | If resilience patterns needed  |

## 6. Rules

- **No duplicate truth**: Service IDs must reference ARC-01 components.
- **No invention**: API surfaces must derive from canonical spec.
- **Contract stability**: Public APIs must be versioned.
- **Dependency clarity**: All dependencies must be explicit and unidirectional where possible.

## 7. Output Format

### Required Headings (in order)

1. `## Service/Module Index`
   - Table: Service ID | Name | Responsibility | Feature Refs
2. `## Service Contracts`
   - Per service subsection:
     - `### <Service ID>: <Name>`
     - Responsibility
     - Public API Surface
     - Dependencies
     - Data Ownership
     - Error Handling
3. `## Dependency Graph`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: ARC-01 (Architecture Overview), ARC-02 (Data Flow), PRD-03 (Feature List)
- **Downstream**: API templates, Implementation templates, Feature Packs
- **Entity Types Referenced**: features, data entities, workflows

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Service/Module Index  | Required  | Required     | Required |
| Service Contracts     | Optional  | Required     | Required |
| Dependency Graph      | Optional  | Optional     | Required |
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
- [ ] All service IDs resolve to ARC-01 components
- [ ] No contradictions between service contracts and data flows
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Every service traces to at least one feature
