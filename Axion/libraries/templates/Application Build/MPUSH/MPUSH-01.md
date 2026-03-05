# MPUSH-01 — Notification Types Catalog (by notif_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-01                                             |
| Template Type     | Build / Push Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring notification types catalog (by notif_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Notification Types Catalog (by notif_id) Document                         |

## 2. Purpose

Create the canonical catalog of push notification types, indexed by notif_id, including purpose,
triggering events, targeting rules, payload shape reference, and deep link behavior. This
template must be consistent with routing/deep links and must not invent notif_ids not present in
upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-03 Deep Link Map: {{route.deep_link_map}} | OPTIONAL
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Notification type regi... | spec         | Yes             |
| notif_id (stable ident... | spec         | Yes             |
| name (human-readable)     | spec         | Yes             |
| purpose (why it exists)   | spec         | Yes             |
| trigger source (event_... | spec         | Yes             |
| targeting rules (who r... | spec         | Yes             |
| priority level (low/no... | spec         | Yes             |
| delivery channel (push)   | spec         | Yes             |
| deep link behavior (li... | spec         | Yes             |
| user-facing copy keys ... | spec         | Yes             |
| disable/opt-out suppor... | spec         | Yes             |

## 5. Optional Fields

Quiet hours applicability | OPTIONAL
Collapse/grouping key | OPTIONAL

Sensitive content rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent notif_ids; use only {{spec.notifications_by_id}} if present, else mark UNKNOWN
- **and flag.**
- **Deep link targets MUST be allowlisted ({{xref:ROUTE-03}}/{{xref:MDL-02}}).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Catalog Summary`
2. `## Notification Types (by notif_id)`
3. `## Notification`
4. `## copy_keys:`
5. `## open_questions:`
6. `## (Repeat per notif_id.)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:ROUTE-03}} | OPTIONAL**
- **Downstream: {{xref:MPUSH-02}}, {{xref:MPUSH-05}} | OPTIONAL**
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
