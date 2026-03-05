# DMG-04 — Event Vocabulary (canonical

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DMG-04                                             |
| Template Type     | Product / Domain Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring event vocabulary (canonical    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Event Vocabulary (canonical Document                         |

## 2. Purpose

Define the canonical event/action names used across analytics, audit logs, workflows,
notifications, and (if applicable) event-driven architecture. This prevents naming drift and
enables deterministic mapping (SMIP, OBS, AUDIT, EVT/WEBHOOKS).

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- DMG-02: {{xref:DMG-02}}
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- BRP-01: {{xref:BRP-01}} | OPTIONAL
- SMIP-02: {{xref:SMIP-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Event list (minimum 15... | spec         | Yes             |
| For each event:           | spec         | Yes             |
| ○ event_id                | spec         | Yes             |
| ○ event_name (canonical)  | spec         | Yes             |
| ○ trigger (what causes... | spec         | Yes             |
| ○ actor (who/what emits)  | spec         | Yes             |
| ○ related_entity_ids      | spec         | Yes             |
| ○ required properties ... | spec         | Yes             |
| ○ optional properties     | spec         | Yes             |
| ○ retention/audit requ... | spec         | Yes             |
| Naming conventions for... | spec         | Yes             |

## 5. Optional Fields

● Versioning strategy | OPTIONAL
● Deprecations | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Event names must be stable and consistent (noun.verb or verb_noun—choose one
- **and stick).**
- If an event is used for analytics, it must align with SMIP-02 naming and property rules.
- If an event is used for audit/security, it must align with SEC/IAM audit requirements.
- Required properties must be concrete; if unknown, mark UNKNOWN and add open
- **question.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Naming Conventions (required)`
2. `## 2) Event Catalog (canonical)`
3. `## event_`
4. `## name`
5. `## trigger`
6. `## actor`
7. `## entity_id`
8. `## s.list[0].`
9. `## name}}`
10. `## .list[0].tr`

## 8. Cross-References

- Upstream: {{xref:DMG-02}}, {{xref:PRD-04}} | OPTIONAL
- Downstream: {{xref:SMIP-02}} | OPTIONAL, {{xref:OBS-}} | OPTIONAL, {{xref:MSG-}} |
- **OPTIONAL, {{xref:API-02}} | OPTIONAL**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
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
