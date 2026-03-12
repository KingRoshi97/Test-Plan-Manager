# CDX-02 — UI Copy Inventory (labels,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CDX-02                                             |
| Template Type     | Design / Content                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring ui copy inventory (labels,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled UI Copy Inventory (labels, Document                         |

## 2. Purpose

Create the canonical inventory of UI copy strings used across screens: titles, labels, buttons,
helper text, tooltips, and confirmations. This enables consistency, localization, and
implementation without copy drift.

## 3. Inputs Required

- ● DES-02: {{xref:DES-02}} | OPTIONAL
- ● DES-03: {{xref:DES-03}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}}
- ● DMG-01: {{xref:DMG-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each entry:           | spec         | Yes             |
| ○ copy_id                 | spec         | Yes             |
| ○ screen_id (or global)   | spec         | Yes             |
| ○ component_id (optional) | spec         | Yes             |
| ○ string_key (implemen... | spec         | Yes             |
| ○ default_text            | spec         | Yes             |
| ○ intent (what it comm... | spec         | Yes             |
| ○ tone context (from C... | spec         | Yes             |
| ○ placeholders (if any)   | spec         | Yes             |
| ○ accessibility note (... | spec         | Yes             |
| ○ max length guidance ... | spec         | Yes             |
| ○ localization note (i... | spec         | Yes             |

## 5. Optional Fields

● Variants by platform (web/mobile) | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- Must comply with CDX-01 voice/tone/terminology.
- Placeholders must be explicit and consistent (e.g., {name}, {count}).
- Avoid embedding PII in logs; copy entries should not require showing sensitive values
- **unless allowed.**
- If the visible label differs from the aria label, both must be specified.

## 7. Output Format

### Required Headings (in order)

1. `## 1) String Key Rules (required)`
2. `## 2) UI Copy Inventory (canonical)`
3. `## stri`
4. `## ng_`
5. `## key`
6. `## scree`
7. `## n_id`
8. `## compo`
9. `## nent_i`
10. `## locat`

## 8. Cross-References

- Upstream: {{xref:CDX-01}}, {{xref:DES-02}} | OPTIONAL, {{xref:DES-03}} | OPTIONAL
- Downstream: {{xref:CDX-03}}, {{xref:CDX-04}}, {{xref:CDX-05}} | OPTIONAL, {{xref:FE-}}
- **| OPTIONAL, {{xref:L10N-}} | OPTIONAL**
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
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
