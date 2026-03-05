# UICP-01 — Page Composition Patterns (shells, sections)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-01                                             |
| Template Type     | Build / UI Composition                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring page composition patterns (shells, sections)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Page Composition Patterns (shells, sections) Document                         |

## 2. Purpose

Define the canonical page composition patterns used across the app: layout shells, section
structures, standard regions, and how pages compose components into consistent, reusable
patterns. This template must be consistent with route/layout specs and must not invent page
pattern IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FE-01 Route Map + Layout Spec: {{fe.route_layout}} | OPTIONAL
- UICP-04 Content Hierarchy Rules: {{ui.content_hierarchy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Page pattern registry ... | spec         | Yes             |
| Shell types supported ... | spec         | Yes             |
| Standard regions per s... | spec         | Yes             |
| Composition rules (ord... | spec         | Yes             |
| Spacing/padding rules ... | spec         | Yes             |
| Responsive composition... | spec         | Yes             |
| Accessibility consider... | spec         | Yes             |
| Examples/pattern usage... | spec         | Yes             |

## 5. Optional Fields

Per-domain pattern variants | OPTIONAL
Animation/motion guidance | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new pattern_ids; use only {{spec.ui_patterns_by_id}} if present, else mark
UNKNOWN.
Patterns MUST be reusable and consistent with FE-01 shells.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Shell Types
shells_supported: {{shells.supported}}
regions_by_shell: {{shells.regions_by_shell}} | OPTIONAL
2. Page Pattern Registry
Pattern
pattern_id: {{patterns[0].pattern_id}}
name: {{patterns[0].name}}
shell_id: {{patterns[0].shell_id}} | OPTIONAL
description: {{patterns[0].description}}
regions_used: {{patterns[0].regions_used}}
sections (ordered):
{{patterns[0].sections[0]}}
{{patterns[0].sections[1]}} | OPTIONAL
responsive_rules: {{patterns[0].responsive_rules}} | OPTIONAL
a11y_notes: {{patterns[0].a11y_notes}} | OPTIONAL
usage_rules: {{patterns[0].usage_rules}} | OPTIONAL
open_questions:
{{patterns[0].open_questions[0]}} | OPTIONAL
(Repeat per pattern_id.)
3. Section Types
section_types: {{sections.types}}
section_nesting_rules: {{sections.nesting_rules}} | OPTIONAL
4. Composition Rules
ordering_rules: {{compose.ordering_rules}}
nesting_rules: {{compose.nesting_rules}} | OPTIONAL
5. Spacing & Responsive Binding
spacing_ref: {{spacing.spacing_ref}} (expected: {{xref:UICP-04}}) | OPTIONAL
padding_rules: {{spacing.padding_rules}} | OPTIONAL
6. References
Route/layout shells: {{xref:FE-01}} | OPTIONAL
Content hierarchy: {{xref:UICP-04}} | OPTIONAL

Cross-References
Upstream: {{xref:FE-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:UICP-02}}, {{xref:UICP-03}}, {{xref:UICP-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for pattern registry if not provided; define shell/region
baseline.
intermediate: Required. Define sections and ordering rules and responsive guidelines.
advanced: Required. Add a11y notes and per-domain pattern variants where applicable.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, regions_by_shell, shell_id, section
examples, responsive rules, a11y notes, usage rules, section nesting, compose nesting,
spacing/padding rules, per-domain variants, motion guidance, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If shells.supported is UNKNOWN → block Completeness Gate.
If patterns registry is UNKNOWN → block Completeness Gate.
If compose.ordering_rules is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.UICP
Pass conditions:
required_fields_present == true
shells_and_regions_defined == true
pattern_registry_defined == true
composition_rules_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

UICP-02

UICP-02 — Component Composition Rules (props, slots, variants)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new pattern_ids; use only {{spec.ui_patterns_by_id}} if present, else mark
- **UNKNOWN.**
- **Patterns MUST be reusable and consistent with FE-01 shells.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Shell Types`
2. `## Page Pattern Registry`
3. `## Pattern`
4. `## sections (ordered):`
5. `## open_questions:`
6. `## (Repeat per pattern_id.)`
7. `## Section Types`
8. `## Composition Rules`
9. `## Spacing & Responsive Binding`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FE-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:UICP-02}}, {{xref:UICP-03}}, {{xref:UICP-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
