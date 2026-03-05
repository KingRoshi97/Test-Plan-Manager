# IAN-02 — Route & Deep Link Spec (route

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAN-02                                             |
| Template Type     | Design / Information Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring route & deep link spec (route    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Route & Deep Link Spec (route Document                         |

## 2. Purpose

Define the canonical routing contract: route IDs/paths, parameters, and deep link behavior. This
makes navigation implementable and prevents route drift across web/mobile and across
releases.

## 3. Inputs Required

- ● IAN-01: {{xref:IAN-01}}
- ● DES-02: {{xref:DES-02}} | OPTIONAL
- ● PRD-03: {{xref:PRD-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Route naming convention (IDs + optional path patterns)
● Route list (minimum equals DES-02 screens unless explicitly “screenless”)
● For each route:
○ route_id
○ screen_id
○ path pattern (web) | OPTIONAL
○ deep link pattern(s) (mobile) | OPTIONAL
○ params schema (name/type/required/default)
○ access requirements (role/entitlement)
○ navigation type (push/replace/modal/tab)
○ canonical back target (where “back” goes)
○ analytics hook (screen_view event name) | OPTIONAL
● Deep link behavior rules:
○ cold start handling
○ auth gating handling
○ invalid param handling
○ unknown route handling

## 5. Optional Fields

● Legacy route aliases | OPTIONAL
● SEO notes (web) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- route_id must be stable and never reused for a different screen.
- Params must be explicitly typed; avoid “stringly typed” ambiguity.
- Deep links must have deterministic fallbacks (e.g., send to safe landing).
- Access requirements must align with PRD-03/IAM/BRP entitlements; do not invent.
- If a route is removed, define deprecation/redirect policy (REL).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Naming Conventions (required)`
2. `## 2) Route Catalog (canonical)`
3. `## screen_`
4. `## path_`
5. `## patter`
6. `## deeplin`
7. `## k_patte`
8. `## rns`
9. `## param`
10. `## s_sche`

## 8. Cross-References

- Upstream: {{xref:IAN-01}}, {{xref:DES-02}} | OPTIONAL
- Downstream: {{xref:FE-01}} | OPTIONAL, {{xref:MOB-01}} | OPTIONAL,
- **{{xref:ROUTE-*}} | OPTIONAL, {{xref:REL-02}} | OPTIONAL**
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
