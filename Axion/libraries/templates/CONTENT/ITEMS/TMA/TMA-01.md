# TMA-01 — Threat Model Scope & Method (assets, actors, STRIDE)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-01                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring threat model scope & method (assets, actors, stride)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Threat Model Scope & Method (assets, actors, STRIDE) Document                         |

## 2. Purpose

Define the canonical scope and method for threat modeling: what assets and surfaces are
included, attacker personas, and the analysis method (e.g., STRIDE), plus required outputs
(abuse cases, risk register). This template anchors the TMA series and must align with security
architecture.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Scope statement (what ... | spec         | Yes             |
| Out-of-scope statement... | spec         | Yes             |
| Assets list (asset_id ... | spec         | Yes             |
| Actor list (actor_id l... | spec         | Yes             |
| Threat modeling method... | spec         | Yes             |
| Required outputs list ... | spec         | Yes             |
| Review cadence (when u... | spec         | Yes             |
| Ownership (who maintai... | spec         | Yes             |
| Telemetry/evidence poi... | spec         | Yes             |

## 5. Optional Fields

Assumed constraints (time/tools) | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Do not invent assets/actors; if missing, mark UNKNOWN and flag.
Method must be explicit and consistently applied.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Scope
in_scope:
{{scope.in[0]}}
{{scope.in[1]}}
out_of_scope:
{{scope.out[0]}}
{{scope.out[1]}}
2. Assets
Asset
asset_id: {{assets[0].asset_id}}
name: {{assets[0].name}}
data_classes: {{assets[0].data_classes}} | OPTIONAL
notes: {{assets[0].notes}} | OPTIONAL
(Repeat per asset.)
3. Actors
Actor
actor_id: {{actors[0].actor_id}}
name: {{actors[0].name}}
capabilities: {{actors[0].capabilities}} | OPTIONAL
(Repeat per actor.)
4. Method
method: {{method.name}} (STRIDE/PASTA/UNKNOWN)
steps: {{method.steps}} | OPTIONAL
5. Diagrams
required_diagrams: {{diagrams.required}}
dfd_ref: {{diagrams.dfd_ref}} | OPTIONAL
6. Required Outputs
outputs: {{outputs.list}} (expected: {{xref:TMA-02}}, {{xref:TMA-04}}, {{xref:TMA-05}})
7. Governance
owner: {{gov.owner}}
review_cadence: {{gov.review_cadence}}
tracking_location: {{gov.tracking_location}} | OPTIONAL

8. References
Security architecture: {{xref:SEC-02}} | OPTIONAL
Attack surface: {{xref:TMA-03}} | OPTIONAL
Data inventory: {{xref:PRIV-01}} | OPTIONAL
Cross-References
Upstream: {{xref:SEC-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:TMA-02}}, {{xref:TMA-04}}, {{xref:TMA-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define scope, method, and at least starter assets/actors lists (UNKNOWN
allowed if flagged).
intermediate: Required. Define diagrams and outputs and tracking.
advanced: Required. Add explicit actor capabilities and review cadence rigor and traceability
pointers.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, data classes/notes, capabilities, method
steps, dfd ref, tracking location, constraints, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scope.in is UNKNOWN → block Completeness Gate.
If assets list is UNKNOWN → block Completeness Gate.
If actors list is UNKNOWN → block Completeness Gate.
If method.name is UNKNOWN → block Completeness Gate.
If gov.owner is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.TMA
Pass conditions:
required_fields_present == true
scope_assets_actors_defined == true
method_defined == true
governance_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

TMA-02

TMA-02 — Abuse Case Catalog (by abuse_id)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not invent assets/actors; if missing, mark UNKNOWN and flag.
- **Method must be explicit and consistently applied.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Scope`
2. `## in_scope:`
3. `## out_of_scope:`
4. `## Assets`
5. `## Asset`
6. `## (Repeat per asset.)`
7. `## Actors`
8. `## Actor`
9. `## (Repeat per actor.)`
10. `## Method`

## 8. Cross-References

- **Upstream: {{xref:SEC-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:TMA-02}}, {{xref:TMA-04}}, {{xref:TMA-05}} | OPTIONAL**
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
