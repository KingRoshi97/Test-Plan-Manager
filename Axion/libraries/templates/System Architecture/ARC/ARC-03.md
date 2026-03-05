# ARC-03 — Key Workflow Data Flows

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-03                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring key workflow data flows    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Key Workflow Data Flows Document                         |

## 2. Purpose

Define the end-to-end data flows for the system’s highest-value workflows: how requests,
events, and data move through boundaries, where decisions are made, and where failures can
occur. This is the traceable bridge between UX flows and system contracts.

## 3. Inputs Required

- ● DES-01: {{xref:DES-01}} | OPTIONAL
- ● ARC-01: {{xref:ARC-01}} | OPTIONAL
- ● ARC-02: {{xref:ARC-02}} | OPTIONAL
- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● DMG-02: {{xref:DMG-02}} | OPTIONAL
- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Workflow list (minimum... | spec         | Yes             |
| For each workflow:        | spec         | Yes             |
| ○ wf_id (should align ... | spec         | Yes             |
| ○ linked_feature_ids      | spec         | Yes             |
| ○ entry point (screen/... | spec         | Yes             |
| ○ sequence of steps ac... | spec         | Yes             |
| ○ data objects passed ... | spec         | Yes             |
| ○ sync/async transitio... | spec         | Yes             |
| ○ authorization checks... | spec         | Yes             |
| ○ idempotency boundary... | spec         | Yes             |
| ○ failure points + err... | spec         | Yes             |
| ○ observability touchp... | spec         | Yes             |

## 5. Optional Fields

● Diagram pointer(s) | OPTIONAL
● Performance/latency expectations (qualitative) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Every step must specify: boundary → action → output (request/event/data write).
- Any async step must specify delivery expectation and retry behavior pointer.
- Any auth check must reference the policy model (PMAD) or be marked UNKNOWN.
- Failure points must map to ERR taxonomy (ERR-01) and reason code policy if available.
- Do not define UI behavior here; reference DES for UX and focus on system flow.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Workflow Index (summary) (required)`
2. `## name`
3. `## feature_ids`
4. `## entry_poin`
5. `## boundaries_i`
6. `## nvolved`
7. `## primary_suc`
8. `## cess_outco`
9. `## primary_fai`
10. `## lure_modes`

## 8. Cross-References

- **Upstream**: Canonical Spec (CAN-01), Intake Submission (INT-01)
- **Downstream**: Related System Architecture templates
- **Entity Types Referenced**: As defined in canonical spec

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
