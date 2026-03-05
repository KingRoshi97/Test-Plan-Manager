# ARC-01 — System Architecture

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-01                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring system architecture    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled System Architecture Document                         |

## 2. Purpose

Define the high-level system architecture: the major domains/boundaries, responsibilities,
ownership, and how the system is partitioned. This is the architecture-authoritative map that
downstream contracts (API/DATA/RTM/WFO) must align to.

## 3. Inputs Required

- ● PRD-01: {{xref:PRD-01}} | OPTIONAL
- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● DES-01: {{xref:DES-01}} | OPTIONAL
- ● DMG-02: {{xref:DMG-02}} | OPTIONAL
- ● DMG-03: {{xref:DMG-03}} | OPTIONAL
- ● RISK-02: {{xref:RISK-02}} | OPTIONAL
- ● STK-02: {{xref:STK-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Architecture overview ... | spec         | Yes             |
| Domain/boundary list (... | spec         | Yes             |
| For each boundary:        | spec         | Yes             |
| ○ boundary_id             | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ responsibility state... | spec         | Yes             |
| ○ owns (data/entities/... | spec         | Yes             |
| ○ exposes (interfaces/... | spec         | Yes             |
| ○ depends_on (other bo... | spec         | Yes             |
| ○ invariants (must-hol... | spec         | Yes             |
| ○ trust boundary class... | spec         | Yes             |
| ○ owner (team/stakehol... | spec         | Yes             |

## 5. Optional Fields

● Diagrams (text description + pointer) | OPTIONAL
● Alternative architectures considered | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Boundaries must align with DMG-02 concept model; do not invent mismatched entity
- **ownership.**
- Each owned entity/event must have a single primary boundary owner.
- Dependencies must be directional and minimal; cycles must be called out and justified.
- If a boundary decision is contested, it must reference STK-02 (decision log) or be
- **marked UNKNOWN + open question.**
- Do not prescribe deployment details here; topology lives in ARC-08/SBDT (but you may
- **reference it).**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Architecture Summary (required)`
2. `## 2) System Context (required)`
3. `## actor_or_system`
4. `## type`
5. `## (user/service/vendo`
6. `## interaction`
7. `## notes`
8. `## 3) Boundary Map (canonical)`
9. `## dar`
10. `## y_i`

## 8. Cross-References

- Upstream: {{xref:PRD-04}} | OPTIONAL, {{xref:DMG-02}} | OPTIONAL, {{xref:DES-01}} |
- **OPTIONAL, {{xref:RISK-02}} | OPTIONAL**
- Downstream: {{xref:ARC-02}}, {{xref:SBDT-01}} | OPTIONAL, {{xref:PMAD-01}} |
- **OPTIONAL, {{xref:ERR-01}} | OPTIONAL, {{xref:RTM-01}} | OPTIONAL, {{xref:WFO-01}}**
- | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
