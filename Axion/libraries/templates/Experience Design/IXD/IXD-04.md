# IXD-04 — Micro-interactions Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXD-04                                             |
| Template Type     | Design / Interaction                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring micro-interactions spec    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Micro-interactions Spec Document                         |

## 2. Purpose

Define the small, repeatable interaction feedback behaviors (micro-interactions) that
communicate system state and affordances: hover, press, focus, drag, loading spinners,
success confirmations, and subtle error feedback. These must be accessible, consistent, and
implementable across platforms.

## 3. Inputs Required

- ● IXD-01: {{xref:IXD-01}} | OPTIONAL
- ● IXD-02: {{xref:IXD-02}} | OPTIONAL
- ● DES-05: {{xref:DES-05}} | OPTIONAL
- ● DES-06: {{xref:DES-06}} | OPTIONAL
- ● DSYS-02: {{xref:DSYS-02}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● A11YD-02: {{xref:A11YD-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| success, error)           | spec         | Yes             |
| For each interaction:     | spec         | Yes             |
| ○ interaction_id          | spec         | Yes             |
| ○ trigger (what user d... | spec         | Yes             |
| ○ motion behavior (if ... | spec         | Yes             |
| ○ haptic/audio (if mob... | spec         | Yes             |
| ○ do/don’t rules          | spec         | Yes             |
| ○ reduced motion behavior | spec         | Yes             |

## 5. Optional Fields

● Component-specific overrides | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Micro-interactions must never be the only signal; pair with non-motion cues.
- Hover interactions must have keyboard/focus equivalents.
- Drag interactions must have a non-drag alternative (buttons, menus, etc.).
- Loading must have a maximum “no feedback” time; if longer, show progress state.
- Do not encode meaning only in color; describe feedback in state terms.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Micro-interactions Catalog (canonical)`
2. `## inte`
3. `## ract`
4. `## ion`
5. `## _id`
6. `## eleme`
7. `## nt_typ`
8. `## trigg`
9. `## feedb`
10. `## ack`

## 8. Cross-References

- Upstream: {{xref:IXD-01}}, {{xref:IXD-02}}, {{xref:DES-05}} | OPTIONAL, {{xref:DES-06}}
- | OPTIONAL
- Downstream: {{xref:DSYS-02}} | OPTIONAL, {{xref:FE-}} | OPTIONAL, {{xref:MOB-}} |
- **OPTIONAL, {{xref:QA-02}} | OPTIONAL**
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
