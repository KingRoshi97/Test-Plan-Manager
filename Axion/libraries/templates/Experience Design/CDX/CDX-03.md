# CDX-03 — Empty States & Onboarding

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CDX-03                                             |
| Template Type     | Design / Content                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring empty states & onboarding    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Empty States & Onboarding Document                         |

## 2. Purpose

Define the canonical copy for empty states and onboarding moments so the product
consistently guides users when there’s nothing to show yet, or when users are learning the
system. This includes messaging, CTAs, and intent—mapped to screens and states.

## 3. Inputs Required

- ● DES-05: {{xref:DES-05}} | OPTIONAL
- ● DES-03: {{xref:DES-03}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}}
- ● CDX-02: {{xref:CDX-02}} | OPTIONAL
- ● URD-03: {{xref:URD-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Empty state entries (m... | spec         | Yes             |
| Onboarding entries (mi... | spec         | Yes             |
| For each entry:           | spec         | Yes             |
| ○ copy_id                 | spec         | Yes             |
| ○ screen_id               | spec         | Yes             |
| ○ state (empty/onboard... | spec         | Yes             |
| ○ title text              | spec         | Yes             |
| ○ body text               | spec         | Yes             |
| ○ CTA text (if any)       | spec         | Yes             |
| ○ CTA action intent (w... | spec         | Yes             |
| ○ eligibility/access c... | spec         | Yes             |
| ○ linked feature_id(s)... | spec         | Yes             |

## 5. Optional Fields

● Visual companion guidance (what an illustration should convey) | OPTIONAL
● Progressive onboarding sequence (steps) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Must comply with CDX-01 voice/tone rules.
- Empty states must be actionable where possible (suggest next step).
- Never blame the user; keep language constructive.
- If state is “no access,” language must align to entitlements and avoid exposing restricted
- **details.**
- Keep onboarding steps short; one concept per step.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Empty States Catalog (required)`
2. `## scree`
3. `## n_id`
4. `## state_`
5. `## type`
6. `## title`
7. `## bod`
8. `## cta`
9. `## _te`
10. `## cta_in`

## 8. Cross-References

- Upstream: {{xref:CDX-01}}, {{xref:CDX-02}} | OPTIONAL, {{xref:DES-05}} | OPTIONAL,
- **{{xref:URD-03}} | OPTIONAL**
- Downstream: {{xref:VAP-01}} | OPTIONAL, {{xref:FE-}} | OPTIONAL, {{xref:MOB-}} |
- OPTIONAL
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
