# PRD-04 — Feature Catalog (by ID) +

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-04                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring feature catalog (by id) +    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Feature Catalog (by ID) + Document                         |

## 2. Purpose

Define the authoritative, machine-addressable catalog of product features using stable feature
IDs. This is the anchor for planning, design, implementation, and test coverage. Each feature
includes acceptance hooks that point downstream to flows, screens, endpoints, and test cases
(without redefining those details here).

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- SPEC_INDEX: {{spec.index}}
- PRD-01: {{xref:PRD-01}}
- PRD-03: {{xref:PRD-03}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing backlog: {{inputs.backlog}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each feature:         | spec         | Yes             |
| ○ feature_id (stable)     | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| description               | spec         | Yes             |
| primary persona(s)        | spec         | Yes             |
| priority (P0/P1/P2)       | spec         | Yes             |
| status (planned/in_pro... | spec         | Yes             |
| dependencies (feature_... | spec         | Yes             |
| success signals (high ... | spec         | Yes             |
| allowed                   | spec         | Yes             |

## 5. Optional Fields

●
●
●
●
●

Feature exclusions (not in MVP) | OPTIONAL
Feature risks | OPTIONAL
Effort estimate (t-shirt sizing) | OPTIONAL
Rollout strategy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Feature IDs must be stable and unique. Do not renumber once assigned.
- Use this format for IDs unless constrained otherwise: feat_<short_slug> (e.g.,
- 
- 
- 
- 
- **feat_auth_login).**
- Do not invent personas/roles; reference: {{spec.personas_by_id}} | OPTIONAL,
- **{{xref:PRD-03}} | OPTIONAL**
- **Acceptance hooks are pointers only; details live in downstream docs**
- **(DES/ARC/API/QA).**
- If a required feature attribute is unknown, mark UNKNOWN and add to Open Questions.
- **Every P0 feature must have at least one acceptance hook in each of:**
- **○ Flow OR Screen (DES)**
- **○ Endpoint OR Component (ARC/API/FE)**
- **○ Test case (QA)**
- If not available yet, placeholders are allowed but must be present.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Feature Index (summary)`
2. `## feature_id`
3. `## name`
4. `## priority`
5. `## primary_pe`
6. `## rsonas`
7. `## status`
8. `## depends_on`
9. `## _by_id[feat_x].i by_id[feat_x].na`
10. `## d}}`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-03}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- Downstream: {{xref:DES-01}}, {{xref:DES-04}}, {{xref:ARC-02}}, {{xref:IMP-01}},
- **{{xref:QA-01}}, {{xref:QA-02}}**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
