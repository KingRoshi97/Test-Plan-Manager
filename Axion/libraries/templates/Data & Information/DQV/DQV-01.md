# DQV-01 — Validation Policy (schema vs

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DQV-01                                             |
| Template Type     | Data / Quality                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring validation policy (schema vs    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Validation Policy (schema vs Document                         |

## 2. Purpose

Define the system’s validation policy: what is validated at schema level vs semantic level, where
validation happens (client/server/DB), how failures are handled, and how validation ties into
error taxonomy and reason codes.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● API-02: {{xref:API-02}} | OPTIONAL
- ● FORM-01: {{xref:FORM-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Definitions:
○ schema validation (shape/type/required)
○ semantic validation (cross-field/business invariants)
● Enforcement points:
○ client (forms)
○ server (API boundary)
○ DB (constraints)
● Validation responsibilities matrix:
○ what must be validated where (minimum 12 rules)
● Failure handling rules:
○ reject vs quarantine vs default
○ error_class assignment
○ reason_code policy (ERR-02)
● Unknown/extra fields policy:
○ strict vs permissive parsing
● Performance rules (avoid expensive validation in hot paths)
● Verification checklist

Optional Fields
● Streaming/batch validation notes | OPTIONAL
● Notes | OPTIONAL

Rules
● Client validation improves UX but is non-authoritative; server must enforce.
● Semantic validation must reference canonical rules (DMG-03/BRP).
● Validation failures must map to reason codes where user-visible.
● Unknown fields handling must be explicit and consistent across endpoints.

Output Format
1) Definitions (required)
● Schema validation: {{defs.schema}}
● Semantic validation: {{defs.semantic}}

2) Enforcement Points (required)
● Client: {{enforcement.client}}
● Server: {{enforcement.server}}
● DB: {{enforcement.db}}

3) Responsibilities Matrix (required)
rul validati
e_i on_typ
d
e

enfor
ced_
at

applies_to

descript
ion

failure_b
ehavior

error_cl
ass

reason
_code

notes

v_
01

schem
a

serve
r

{{matrix[0].a
pplies_to}}

{{matrix[
0].desc}}

{{matrix[0]
.failure}}

{{matrix[0 {{matrix
].class}}
[0].rc}}

{{matrix[0
].notes}}

v_
02

semant
ic

serve
r

{{matrix[1].a
pplies_to}}

{{matrix[
1].desc}}

{{matrix[1]
.failure}}

{{matrix[1 {{matrix
].class}}
[1].rc}}

{{matrix[1
].notes}}

4) Unknown/Extra Fields Policy (required)
● Input strictness: {{unknown.strictness}}
● Extra fields behavior: {{unknown.extra_fields}}
● Logging policy: {{unknown.logging}} | OPTIONAL

5) Performance Rules (required)
● Hot path rule: {{perf.hot_path}}
● Batch validation rule: {{perf.batch}} | OPTIONAL

6) Verification Checklist (required)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}} | OPTIONAL

Cross-References
● Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:ERR-01}} | OPTIONAL, {{xref:BRP-01}} |
OPTIONAL
● Downstream: {{xref:DQV-02}}, {{xref:DQV-03}}, {{xref:DATA-06}} | OPTIONAL,
{{xref:ERR-04}} | OPTIONAL
● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules

● beginner: Required. Definitions + enforcement points.
● intermediate: Required. Add responsibilities matrix and unknown fields policy.
● advanced: Required. Add failure behavior mapping and performance rules.

Unknown Handling
● UNKNOWN_ALLOWED: streaming_batch_notes, notes, logging_policy
● If server enforcement is not specified → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.DQV
● Pass conditions:
○ required_fields_present == true
○ definitions_present == true
○ enforcement_points_present == true
○ responsibilities_matrix_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

DQV-02

DQV-02 — Data Quality Checks Catalog
(rules by entity)
Header Block
● template_id: DQV-02
● title: Data Quality Checks Catalog (rules by entity)
● type: data_quality_validation
● template_version: 1.0.0
● output_path: 10_app/data_quality/DQV-02_Data_Quality_Checks_Catalog.md
● compliance_gate_id: TMP-05.PRIMARY.DQV
● upstream_dependencies: ["DATA-01", "DATA-03", "DQV-01"]
● inputs_required: ["DATA-01", "DATA-03", "DQV-01", "ERR-02", "OBS-02",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}

Purpose
Define the catalog of data quality checks that continuously validate correctness, completeness,
and integrity of stored data. These checks detect drift, corruption, and broken invariants over
time.

Inputs Required
● DATA-01: {{xref:DATA-01}} | OPTIONAL
● DATA-03: {{xref:DATA-03}} | OPTIONA

## 5. Optional Fields

● Streaming/batch validation notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Client validation improves UX but is non-authoritative; server must enforce.
- Semantic validation must reference canonical rules (DMG-03/BRP).
- Validation failures must map to reason codes where user-visible.
- Unknown fields handling must be explicit and consistent across endpoints.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Definitions (required)`
2. `## 2) Enforcement Points (required)`
3. `## 3) Responsibilities Matrix (required)`
4. `## rul validati`
5. `## e_i on_typ`
6. `## enfor`
7. `## ced_`
8. `## applies_to`
9. `## descript`
10. `## ion`

## 8. Cross-References

- Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:ERR-01}} | OPTIONAL, {{xref:BRP-01}} |
- OPTIONAL
- Downstream: {{xref:DQV-02}}, {{xref:DQV-03}}, {{xref:DATA-06}} | OPTIONAL,
- **{{xref:ERR-04}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
