# DES-05 — UI State Model

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-05                                             |
| Template Type     | Design / UX                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring ui state model    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled UI State Model Document                         |

## 2. Purpose

Define the canonical UX behavior for common UI states so screens are consistent: loading,
empty, error, success, disabled, offline, and permission denied.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- DES-01: {{xref:DES-01}}
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- CDX-04: {{xref:CDX-04}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each state:           | spec         | Yes             |
| ○ state_id                | spec         | Yes             |
| ○ definition              | spec         | Yes             |
| ○ when it occurs (cond... | spec         | Yes             |
| ○ user feedback (what ... | spec         | Yes             |
| ○ retry/recovery actio... | spec         | Yes             |
| ○ logging/telemetry ex... | spec         | Yes             |
| ○ accessibility consid... | spec         | Yes             |

## 5. Optional Fields

● Component-level state guidelines | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- **Error states must define user action options (retry, back, support, etc.).**
- **Offline behavior must be consistent with MOB-03 (if mobile/offline).**
- **Permission denied must align to IAM/BRP entitlements.**
- **Avoid duplicating copy; reference CDX-04 for exact messages if available.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) State Catalog (canonical)`
2. `## state`
3. `## _id`
4. `## definition`
5. `## when_occ`
6. `## urs`
7. `## user_feedb`
8. `## ack`
9. `## a11y_note`
10. `## telemetry_n`

## 8. Cross-References

- Upstream: {{xref:DES-01}}, {{xref:PRD-06}} | OPTIONAL
- Downstream: {{xref:DES-03}}, {{xref:FE-07}} | OPTIONAL, {{xref:CER-*}} | OPTIONAL,
- **{{xref:MOB-03}} | OPTIONAL**
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
