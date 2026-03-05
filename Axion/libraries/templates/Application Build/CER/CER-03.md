# CER-03 — Offline/Error Mode UX (degraded experiences)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-03                                             |
| Template Type     | Build / Client Error Recovery                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring offline/error mode ux (degraded experiences)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Offline/Error Mode UX (degraded experiences) Document                         |

## 2. Purpose

Define the canonical user experience for offline and degraded-error modes: what UI is shown
when offline, how cached data is indicated, what actions are disabled, how queued operations
are communicated, and how the client recovers when connectivity returns. This template must
be consistent with UI state model and offline state handling and must not invent UX states not
present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FE-03 UI State Model: {{fe.state_model}}
- FE-07 Error Handling UX: {{fe.error_ux}} | OPTIONAL
- SMD-05 Offline Handling: {{smd.offline_handling}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Offline detection UX t... | spec         | Yes             |
| Global offline banner/... | spec         | Yes             |
| Per-screen offline aff... | spec         | Yes             |
| Cached/stale data labe... | spec         | Yes             |
| Queued write indicator... | spec         | Yes             |
| Disabled action rules ... | spec         | Yes             |
| Copy policy (what to say) | spec         | Yes             |
| Recovery UX (reconnect... | spec         | Yes             |
| Accessibility rules (a... | spec         | Yes             |

## 5. Optional Fields

Airplane mode differences | OPTIONAL

Per-route exceptions | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Offline UX MUST match offline handling model ({{xref:SMD-05}}).**
- **Offline status changes SHOULD be announced for accessibility ({{xref:FE-05}}) | OPTIONAL.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Offline Trigger`
2. `## Global Indicator`
3. `## Per-Screen Behavior`
4. `## Cached/Stale Labeling`
5. `## Queued Writes`
6. `## Disabled Action Rules`
7. `## Copy Policy`
8. `## Recovery UX`
9. `## Accessibility`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FE-03}}, {{xref:SMD-05}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:CER-04}}, {{xref:CER-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-A11Y]}} | OPTIONAL

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
