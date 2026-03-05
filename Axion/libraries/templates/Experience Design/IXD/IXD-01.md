# IXD-01 — Interaction Patterns Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXD-01                                             |
| Template Type     | Design / Interaction                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring interaction patterns catalog    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Interaction Patterns Catalog Document                         |

## 2. Purpose

Define the canonical catalog of interaction patterns used across the product so interactions are
consistent, learnable, and implementable. This is the behavioral contract for UI mechanics (not
visual styling), and it must include accessibility expectations and default fallbacks.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- ●
- DES-01: {{xref:DES-01}} | OPTIONAL
- DES-03: {{xref:DES-03}} | OPTIONAL
- DES-06: {{xref:DES-06}} | OPTIONAL
- DES-07: {{xref:DES-07}} | OPTIONAL
- DSYS-02: {{xref:DSYS-02}} | OPTIONAL
- A11YD-02: {{xref:A11YD-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Pattern list (minimum ... | spec         | Yes             |
| For each pattern:         | spec         | Yes             |
| ○ pattern_id              | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ purpose (why it exists) | spec         | Yes             |
| ○ when_to_use             | spec         | Yes             |
| ○ when_not_to_use         | spec         | Yes             |
| ○ trigger (what opens/... | spec         | Yes             |
| ○ dismissal/exit rules... | spec         | Yes             |
| ○ primary states (load... | spec         | Yes             |
| ○ platform notes (web/... | spec         | Yes             |
| ○ mapping to component... | spec         | Yes             |

## 5. Optional Fields

● Anti-patterns (explicitly forbidden variants) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Pattern IDs must be stable and unique (pat_<slug>).
- Must not conflict with DES-05 state rules or DES-07 error rules; reference them.
- Any pattern that traps focus must define:
- **○ focus entry point**
- **○ focus loop rules**
- **○ escape behavior**
- Any gesture pattern must define a non-gesture fallback (accessibility + desktop).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Pattern Index (summary)`
2. `## patte`
3. `## rn_id`
4. `## name`
5. `## category`
6. `## primary_use`
7. `## key_accessibilit`
8. `## y_requirement`
9. `## platform`
10. `## pat_`

## 8. Cross-References

- Upstream: {{xref:DES-03}} | OPTIONAL, {{xref:DES-06}} | OPTIONAL, {{xref:DES-07}} |
- OPTIONAL
- Downstream: {{xref:DSYS-02}} | OPTIONAL, {{xref:FE-02}} | OPTIONAL, {{xref:MOB-*}} |
- **OPTIONAL, {{xref:QA-02}} | OPTIONAL**
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
