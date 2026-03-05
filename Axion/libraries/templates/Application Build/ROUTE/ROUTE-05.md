# ROUTE-05 — Back/History Rules (expected behavior)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-05                                             |
| Template Type     | Build / Routing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring back/history rules (expected behavior)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Back/History Rules (expected behavior) Document                         |

## 2. Purpose

Define the canonical back/history behavior across navigation stacks, tabs, and modals (web and
mobile), including when back closes modals vs navigates, how deep links affect history, and
how to handle edge cases like first screen back. This template must be consistent with
navigation map and interaction patterns and must not invent navigation behaviors not present in
upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-02 Navigation Map: {{route.nav_map}}
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- UICP-05 Interaction Patterns: {{ui.interaction_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Global back behavior s... | spec         | Yes             |
| Modal back behavior (c... | spec         | Yes             |
| Tab back behavior (per... | spec         | Yes             |
| Stack back behavior (p... | spec         | Yes             |
| Deep link entry back b... | spec         | Yes             |
| First-screen back beha... | spec         | Yes             |
| Browser back behavior ... | spec         | Yes             |
| Android back behavior ... | spec         | Yes             |
| Unsaved changes handli... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Custom per-route back overrides | OPTIONAL

Gesture back rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Back behavior MUST be deterministic and consistent across shells.**
- **Unsaved changes confirmation MUST prevent data loss.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Global Principles`
2. `## principles:`
3. `## Modal Back Behavior`
4. `## Tab Back Behavior`
5. `## Stack Back Behavior`
6. `## Deep Link Entry Back Behavior`
7. `## First-Screen Back`
8. `## (exit_app/confirm_exit/go_home/UNKNOWN)`
9. `## Browser Back (Web)`
10. `## Android Back (Mobile)`

## 8. Cross-References

- **Upstream: {{xref:ROUTE-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ROUTE-06}} | OPTIONAL**
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
