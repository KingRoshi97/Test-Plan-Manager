# ARC-01 — System Architecture Overview

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-01                                             |
| Template Type     | System Architecture                                |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring architecture documentation   |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Standards Snapshot                 |
| Produces          | Filled System Architecture Overview                |

## 2. Purpose

Provide the high-level system architecture overview, including system boundaries, major components, integration points, technology stack decisions, and deployment topology. This is the top-level architecture document that all domain and feature architecture documents reference.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- Standards Snapshot (`{{standards.*}}`)
- PRD-01 Product Requirements
- PRD-03 Feature & Capability List

## 4. Required Fields

| Field Name              | Source       | UNKNOWN Allowed |
|-------------------------|--------------|-----------------|
| System Boundary         | spec         | No              |
| Major Components        | spec         | No              |
| Technology Stack        | spec         | Yes             |
| Integration Points      | spec         | Yes             |
| Deployment Model        | spec         | Yes             |

## 5. Optional Fields

| Field Name              | Source       | Notes                          |
|-------------------------|--------------|--------------------------------|
| Scalability Approach    | spec         | If performance requirements exist |
| Disaster Recovery       | standards    | If DR requirements specified   |
| Migration Strategy      | spec         | If replacing existing system   |

## 6. Rules

- **No duplicate truth**: Components must reference canonical spec feature IDs.
- **No invention**: Technology choices must derive from spec or standards.
- **Consistency**: Component boundaries must align with feature boundaries in PRD-03.
- **Traceability**: Every major component must trace to at least one feature.

## 7. Output Format

### Required Headings (in order)

1. `## System Boundary`
   - System context diagram description
2. `## Major Components`
   - Table: Component ID | Name | Responsibility | Feature Refs
3. `## Technology Stack`
   - Table: Layer | Technology | Rationale | Standard Ref
4. `## Integration Points`
   - Table: Integration ID | External System | Protocol | Data Flow
5. `## Deployment Model`
6. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: PRD-01 (Product Requirements), PRD-03 (Feature List), Canonical Spec (CAN-01)
- **Downstream**: ARC-02 (Data Flow), ARC-03 (Infrastructure), ARC-04 (Service Contracts), Domain Packs
- **Entity Types Referenced**: features, data entities, workflows

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| System Boundary       | Required  | Required     | Required |
| Major Components      | Required  | Required     | Required |
| Technology Stack      | Optional  | Required     | Required |
| Integration Points    | Optional  | Optional     | Required |
| Deployment Model      | Optional  | Optional     | Required |
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
- [ ] All component IDs resolve to canonical spec entities
- [ ] No contradictions between architecture and product requirements
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Every major component traces to a feature
