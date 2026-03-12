# COST-01 — Cost Model Overview (dimensions, owners)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-01                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring cost model overview (dimensions, owners)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Cost Model Overview (dimensions, owners) Document                         |

## 2. Purpose

Create the single, canonical overview of cost modeling for the system: what dimensions are
tracked, who owns cost governance, and how cost is measured and acted upon. This document
anchors the COST set and enables cost-aware operations.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Cost drivers catalog: {{xref:COST-02}} | OPTIONAL
- Cost attribution tags standard: {{xref:COST-08}} | OPTIONAL
- Compliance scope (cost evidence/ownership): {{xref:COMP-01}} | OPTIONAL
- Forecast model: {{xref:COST-03}} | OPTIONAL
- Budget/alerts: {{xref:COST-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Cost dimensions (compu... | spec         | Yes             |
| Attribution model (who... | spec         | Yes             |
| Owners (finops, eng lead) | spec         | Yes             |
| Measurement sources (b... | spec         | Yes             |
| Cadence (weekly/monthl... | spec         | Yes             |
| Decision rules (what t... | spec         | Yes             |
| Cost vs performance tr... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Chargeback/showback notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Cost model must be consistent with tagging and reporting; no “unattributed” costs without a
plan.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Dimensions
dimensions: {{dims.list}}
2. Attribution
attribution_model: {{attrib.model}}
keys: {{attrib.keys}} | OPTIONAL
3. Owners
owners: {{owners.list}}
4. Measurement Sources
sources: {{sources.list}}
5. Cadence
cadence: {{cadence.value}}
6. Decision Rules
rules: {{decisions.rules}}
7. Tradeoffs
tradeoff_principle: {{tradeoff.principle}}
8. Telemetry
cost_anomaly_metric: {{telemetry.cost_anomaly_metric}}
Cross-References
Upstream: {{xref:COST-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-03}}, {{xref:COST-09}}, {{xref:COST-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define dimensions, attribution model, owners, cadence.
intermediate: Required. Define measurement sources, decision rules, telemetry.
advanced: Required. Add showback/chargeback notes and strict tradeoff guidance with
performance ties.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, keys, showback notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If dims.list is UNKNOWN → block Completeness Gate.
If attrib.model is UNKNOWN → block Completeness Gate.
If owners.list is UNKNOWN → block Completeness Gate.

If cadence.value is UNKNOWN → block Completeness Gate.
If telemetry.cost_anomaly_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
dimensions_defined == true
attribution_defined == true
owners_and_cadence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-02

COST-02 — Cost Drivers Catalog (compute, storage, egress)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Cost model must be consistent with tagging and reporting; no “unattributed” costs without a**
- **plan.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Dimensions`
2. `## Attribution`
3. `## Owners`
4. `## Measurement Sources`
5. `## Cadence`
6. `## Decision Rules`
7. `## Tradeoffs`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:COST-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-03}}, {{xref:COST-09}}, {{xref:COST-10}} | OPTIONAL**
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
