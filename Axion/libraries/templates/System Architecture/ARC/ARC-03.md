# ARC-03 — Infrastructure & Cloud Topology

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-03                                             |
| Template Type     | System Architecture                                |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with infrastructure/deployment requirements |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, ARC-01, Standards Snapshot         |
| Produces          | Filled Infrastructure & Cloud Topology document    |

## 2. Purpose

Define the infrastructure topology, cloud resource layout, networking, and environment configuration for the product. This document maps logical architecture components from ARC-01 to physical or cloud infrastructure resources.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- ARC-01 System Architecture Overview
- Standards Snapshot (`{{standards.*}}`)

## 4. Required Fields

| Field Name              | Source       | UNKNOWN Allowed |
|-------------------------|--------------|-----------------|
| Environment List        | spec         | No              |
| Infrastructure Components | spec       | Yes             |
| Network Topology        | spec         | Yes             |
| Resource Sizing         | spec         | Yes             |

## 5. Optional Fields

| Field Name              | Source       | Notes                          |
|-------------------------|--------------|--------------------------------|
| Auto-Scaling Rules      | spec         | If elastic scaling required    |
| CDN Configuration       | spec         | If content delivery in scope   |
| Disaster Recovery Plan  | standards    | If DR requirements specified   |

## 6. Rules

- **No duplicate truth**: Infrastructure components must map to ARC-01 logical components.
- **No invention**: Resource choices must derive from spec or standards.
- **Environment parity**: All environments must follow the same topology pattern.
- **Security**: Network topology must enforce least-privilege access.

## 7. Output Format

### Required Headings (in order)

1. `## Environment Matrix`
   - Table: Environment | Purpose | Region | Access
2. `## Infrastructure Components`
   - Table: Resource | Type | Environment | ARC-01 Component Ref
3. `## Network Topology`
4. `## Resource Sizing`
   - Table: Resource | Size/Tier | Scaling | Rationale
5. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: ARC-01 (Architecture Overview), Standards Snapshot (STD-03)
- **Downstream**: Operations templates, Security templates, CI/CD templates
- **Entity Types Referenced**: features, data entities

## 9. Skill Level Requiredness Rules

| Section                  | Beginner  | Intermediate | Expert   |
|--------------------------|-----------|--------------|----------|
| Environment Matrix       | Required  | Required     | Required |
| Infrastructure Components| Optional  | Required     | Required |
| Network Topology         | Optional  | Optional     | Required |
| Resource Sizing          | Optional  | Optional     | Required |
| Unknowns                 | Optional  | Required     | Required |

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
- [ ] All infrastructure maps to ARC-01 logical components
- [ ] No contradictions between topology and security requirements
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Environment parity is maintained
