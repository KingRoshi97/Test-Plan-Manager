# STK-01 — Stakeholder Map (roles,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | STK-01                                             |
| Template Type     | Product / Stakeholders                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring stakeholder map (roles,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Stakeholder Map (roles, Document                         |

## 2. Purpose

Define who the stakeholders are, what decisions they influence, and what authority they have.
This creates deterministic ownership and prevents approval ambiguity during design, build, and
release.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-02: {{xref:PRD-02}} | OPTIONAL
- PRD-03: {{xref:PRD-03}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Org context: {{inputs.org_context}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Stakeholder list (mini... | spec         | Yes             |
| For each stakeholder:     | spec         | Yes             |
| ○ stakeholder_id          | spec         | Yes             |
| ○ name/role (title)       | spec         | Yes             |
| ○ domain/area of respo... | spec         | Yes             |
| ○ decision rights (wha... | spec         | Yes             |
| ○ communication channel   | spec         | Yes             |
| ○ availability / SLA f... | spec         | Yes             |
| Escalation path (if co... | spec         | Yes             |

## 5. Optional Fields

● External stakeholders | OPTIONAL
● Delegates / backups | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- **Stakeholder IDs must be stable and unique (stk_<slug>).**
- **Decision rights must be written as explicit scopes (not vague “approves everything”).**
- If any required decision area has no owner, mark UNKNOWN and block completeness.
- **This doc defines “who decides,” STK-02 defines “what was decided.”**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Stakeholders (canonical)`
2. `## stak`
3. `## ehol`
4. `## der_i`
5. `## name_or`
6. `## _title`
7. `## area`
8. `## decision_rig`
9. `## hts`
10. `## comms`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-02}} | OPTIONAL, {{xref:PRD-03}} | OPTIONAL
- Downstream: {{xref:STK-02}}, {{xref:STK-03}}, {{xref:STK-04}}
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
