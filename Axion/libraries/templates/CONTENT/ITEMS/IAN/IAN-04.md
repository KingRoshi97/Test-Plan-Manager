# IAN-04 — Search/Filter/Sort UX (if

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAN-04                                             |
| Template Type     | Design / Information Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring search/filter/sort ux (if    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Search/Filter/Sort UX (if Document                         |

## 2. Purpose

Define the user experience contract for search, filtering, and sorting across the product (when
applicable): where search exists, what it searches, how filters/sorts behave, and what users see
in empty/error states. This is UX-authoritative and feeds implementation and search/index
design.

## 3. Inputs Required

- ● IAN-03: {{xref:IAN-03}} | OPTIONAL
- ● DES-03: {{xref:DES-03}} | OPTIONAL
- ● URD-03: {{xref:URD-03}} | OPTIONAL
- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}} | OPTIONAL
- ● CDX-02: {{xref:CDX-02}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| For each search surface:  | spec         | Yes             |
| ○ surface_id (screen_i... | spec         | Yes             |
| ○ search scope (what e... | spec         | Yes             |
| ○ query input rules (m... | spec         | Yes             |
| ○ results presentation... | spec         | Yes             |
| ○ ranking expectation ... | spec         | Yes             |
| ○ empty states (no res... | spec         | Yes             |
| ○ error states (networ... | spec         | Yes             |
| ○ accessibility behavi... | spec         | Yes             |
| Filter catalog (if app... | spec         | Yes             |
| Sort catalog (if appli... | spec         | Yes             |

## 5. Optional Fields

● Advanced search operators | OPTIONAL
● Saved searches | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block and do not define catalogs.
- Search and filter labels must follow CDX rules; final strings in CDX-02.
- Must specify deterministic behavior for: debounce, submit, clear, back behavior.
- Must include accessibility rules for keyboard-only use.
- Empty/error state UX must align with DES-05 and CDX catalogs.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Search Surfaces (if applies)`
3. `## surfa`
4. `## ce_id`
5. `## surfac`
6. `## e_typ`
7. `## scope`
8. `## input_`
9. `## rules`
10. `## results`

## 8. Cross-References

- Upstream: {{xref:IAN-03}} | OPTIONAL, {{xref:DES-05}} | OPTIONAL, {{xref:CDX-02}} |
- OPTIONAL
- Downstream: {{xref:DISC-}} | OPTIONAL, {{xref:SRCH-}} | OPTIONAL, {{xref:FE-}} |
- **OPTIONAL, {{xref:MOB-}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL**
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
