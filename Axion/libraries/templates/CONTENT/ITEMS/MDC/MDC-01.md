# MDC-01 — Capabilities Inventory (camera/gps/files/push)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-01                                             |
| Template Type     | Build / Mobile Capabilities                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring capabilities inventory (camera/gps/files/push)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Capabilities Inventory (camera/gps/files/push) Document                         |

## 2. Purpose

Create the canonical inventory of mobile device capabilities used by the app, indexed by
capability_id, including what features/screens use them and the high-level purpose. This
template must be consistent with mobile integration maps and must not invent capability_ids not
present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MOB-03 Native Integration Map: {{mob.native_integrations}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Capability registry (c... | spec         | Yes             |
| capability_id (stable ... | spec         | Yes             |
| name (human-readable)     | spec         | Yes             |
| category (camera/locat... | spec         | Yes             |
| purpose (what it enables) | spec         | Yes             |
| screens/features using... | spec         | Yes             |
| permissions required p... | spec         | Yes             |
| security constraints p... | spec         | Yes             |
| fallback behavior poin... | spec         | Yes             |

## 5. Optional Fields

Platform availability notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new capability_ids unless explicitly allowed; otherwise use UNKNOWN and
- **flag.**
- Each capability MUST bind to at least one screen/feature or be flagged as unused.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Capability Entries (by capability_id)`
3. `## Capability`
4. `## open_questions:`
5. `## (Repeat per capability_id.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:MOB-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MDC-02}}, {{xref:MDC-03}}, {{xref:MDC-04}}, {{xref:MDC-05}} | OPTIONAL**
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
