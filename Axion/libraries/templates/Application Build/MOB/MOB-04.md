# MOB-04 — App Lifecycle + State (foreground/background)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-04                                             |
| Template Type     | Build / Mobile                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring app lifecycle + state (foreground/background)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled App Lifecycle + State (foreground/background) Document                         |

## 2. Purpose

Define the canonical mobile app lifecycle behavior: what happens on foreground/background
transitions, app resume, cold start, memory pressure, and how state is saved/restored. Includes
security/privacy behavior when backgrounded and offline queue behavior. This template must
be consistent with data protection and offline handling and must not invent lifecycle behaviors
not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MOB-01 Navigation Map: {{mob.nav_map}} | OPTIONAL
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- SMD-05 Offline Handling: {{smd.offline_handling}} | OPTIONAL
- MBAT-01 Background Work Rules: {{mbat.bg_work_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| State persistence mode... | spec         | Yes             |
| Resume refresh rules (... | spec         | Yes             |
| Offline queue behavior... | spec         | Yes             |
| Session expiry checks ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Memory pressure handling | OPTIONAL

App update migration rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Background behavior MUST protect sensitive data per {{xref:CSec-02}}.**
- **Offline queue handling MUST align with {{xref:SMD-05}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Lifecycle Events`
2. `## State Persistence`
3. `## Resume Refresh`
4. `## Offline Queue on Resume`
5. `## Security/Privacy on Background`
6. `## Session Checks`
7. `## Deep Links / Push Interaction`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:MOB-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MOB-05}}, {{xref:MBAT-01}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
