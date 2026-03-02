# ARC-02 — Data Flow Diagrams

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-02                                             |
| Template Type     | System Architecture                                |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with data processing or integration    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, ARC-01 Architecture Overview       |
| Produces          | Filled Data Flow Diagrams document                 |

## 2. Purpose

Document the data flows within and between system components, including data sources, transformations, storage locations, and data sinks. Each flow traces to canonical spec entities and maps to the architecture components defined in ARC-01.

## 3. Inputs Required

- Canonical Spec (`{{spec.*}}`)
- ARC-01 System Architecture Overview
- PRD-04 Workflow Excerpts

## 4. Required Fields

| Field Name           | Source       | UNKNOWN Allowed |
|----------------------|--------------|-----------------|
| Data Flow ID         | spec         | No              |
| Source Component     | spec         | No              |
| Target Component     | spec         | No              |
| Data Type            | spec         | No              |
| Protocol             | spec         | Yes             |

## 5. Optional Fields

| Field Name           | Source       | Notes                          |
|----------------------|--------------|--------------------------------|
| Transformation Logic | spec         | If data is transformed in transit |
| Volume Estimates     | spec         | If performance requirements exist |
| Encryption Rules     | standards    | Security-layer requirements    |

## 6. Rules

- **No duplicate truth**: Flow IDs and component references must come from canonical spec.
- **No invention**: Data types must match entities defined in the canonical spec.
- **Completeness**: Every workflow in PRD-04 must have corresponding data flows.
- **Consistency**: Source and target components must exist in ARC-01.

## 7. Output Format

### Required Headings (in order)

1. `## Data Flow Index`
   - Table: Flow ID | Source | Target | Data Type | Protocol | Workflow Ref
2. `## Flow Details`
   - Per flow subsection:
     - `### <Flow ID>: <Source> → <Target>`
     - Data Type & Schema
     - Transformation (if any)
     - Volume/Frequency
3. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: ARC-01 (Architecture Overview), PRD-04 (Workflow Excerpts), Canonical Spec (CAN-01)
- **Downstream**: ARC-04 (Service Contracts), Data templates, API templates
- **Entity Types Referenced**: data entities, workflows, features

## 9. Skill Level Requiredness Rules

| Section               | Beginner  | Intermediate | Expert   |
|-----------------------|-----------|--------------|----------|
| Data Flow Index       | Required  | Required     | Required |
| Flow Details          | Optional  | Required     | Required |
| Transformation Logic  | Optional  | Optional     | Required |
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
- [ ] All component references resolve to ARC-01 entries
- [ ] No contradictions between data flows and architecture
- [ ] Unknowns are handled per UNKNOWN format (section 10)
- [ ] Every workflow has corresponding data flows
