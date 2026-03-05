# RTM-03 — Channel/Topic Model (naming,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RTM-03                                             |
| Template Type     | Architecture / Realtime                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring channel/topic model (naming,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Channel/Topic Model (naming, Document                         |

## 2. Purpose

Define the canonical model for realtime channels/topics: naming, scoping, membership rules,
permission checks for join/publish/subscribe, and how channel identity maps to domain entities
(rooms, streams, orgs).

## 3. Inputs Required

- ● RTM-01: {{xref:RTM-01}} | OPTIONAL
- ● PMAD-01: {{xref:PMAD-01}} | OPTIONAL
- ● PMAD-02: {{xref:PMAD-02}} | OPTIONAL
- ● ARC-05: {{xref:ARC-05}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Channel types list (mi... | spec         | Yes             |
| For each channel type:    | spec         | Yes             |
| ○ channel_type_id         | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ naming convention (t... | spec         | Yes             |
| ○ scope key(s) (org_id... | spec         | Yes             |
| ○ membership model (op... | spec         | Yes             |
| ○ join authorization r... | spec         | Yes             |
| ○ publish authorizatio... | spec         | Yes             |
| ○ subscribe authorizat... | spec         | Yes             |
| ○ visibility (discover... | spec         | Yes             |
| ○ retention/replay pol... | spec         | Yes             |

## 5. Optional Fields

● Multi-tenant isolation notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Channel names must be deterministic and derived from stable identifiers.
- Server-side enforcement required for join and publish.
- Private channels must be non-enumerable (no listing without access).
- If replay/retention exists, define retention limits and access controls.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Naming Rules (required)`
2. `## 2) Channel Types (canonical)`
3. `## cha`
4. `## nne`
5. `## l_ty`
6. `## pe_`
7. `## purp`
8. `## ose`
9. `## nam`
10. `## e_te`

## 8. Cross-References

- Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:RTM-01}} | OPTIONAL
- Downstream: {{xref:RTM-04}}, {{xref:RTM-06}} | OPTIONAL, {{xref:MSG-}} | OPTIONAL,
- **{{xref:OBS-}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-NAMING]}} | OPTIONAL,
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
