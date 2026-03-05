# TMA-02 — Abuse Case Catalog (by abuse_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-02                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring abuse case catalog (by abuse_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Abuse Case Catalog (by abuse_id) Document                         |

## 2. Purpose

Create the canonical catalog of abuse cases (misuse scenarios) the system must defend
against, indexed by abuse_id, including impacted assets, attack steps, detection signals, and
mitigations pointers. This template must align with attack surface inventory and existing
abuse/rate-limit controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Threat model scope/method: {{xref:TMA-01}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Abuse signals/detection: {{xref:RLIM-03}} | OPTIONAL
- Payments fraud controls: {{xref:PAY-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Abuse registry (abuse_id list)
abuse_id (stable identifier)
Title
Impacted surfaces (api/web/mobile/ws)
Impacted assets (asset_id refs)
Attacker type (actor_id ref)
Attack steps (ordered)
Primary impact (fraud, spam, data leak, DoS)
Detection signals (metrics/logs)
Mitigation/control references (RLIM/TMA-05/SEC/IAM)
Residual risk rating (high/med/low/UNKNOWN)
Telemetry requirements (abuse attempts detected)

Optional Fields
Customer harm notes | OPTIONAL
Manual moderation workflow ref | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Each abuse case must link to at least one detection signal and one mitigation/control.
Do not invent actor/asset IDs; use those defined in TMA-01 where possible.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_abuse_cases: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Abuse Cases (repeat per abuse_id)
Abuse Case
abuse_id: {{cases[0].abuse_id}}
title: {{cases[0].title}}
surfaces: {{cases[0].surfaces}}
assets: {{cases[0].assets}}
attacker: {{cases[0].attacker}}
impact: {{cases[0].impact}}
attack_steps:
{{cases[0].steps[0]}}
{{cases[0].steps[1]}}
{{cases[0].steps[2]}} | OPTIONAL
detection_signals: {{cases[0].detection_signals}}
mitigation_refs: {{cases[0].mitigation_refs}}
residual_risk: {{cases[0].residual_risk}}
telemetry_metric: {{cases[0].telemetry_metric}}
customer_harm: {{cases[0].customer_harm}} | OPTIONAL
moderation_ref: {{cases[0].moderation_ref}} | OPTIONAL
(Repeat per abuse case.)
3. References
Attack surface: {{xref:TMA-03}} | OPTIONAL
Risk register: {{xref:TMA-04}} | OPTIONAL
Mitigation mapping: {{xref:TMA-05}} | OPTIONAL
Rate limits/abuse signals: {{xref:RLIM-03}} | OPTIONAL
Enforcement actions: {{xref:RLIM-04}} | OPTIONAL

Cross-References
Upstream: {{xref:TMA-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:TMA-04}}, {{xref:TMA-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define abuse registry and steps and one detection + mitigation per case.
intermediate: Required. Add attacker/asset refs and residual risk rating and telemetry metric.
advanced: Required. Add customer harm/moderation refs and tighter mitigation traceability.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, optional step, customer harm,
moderation ref, actor/asset refs if not available (must be flagged), residual risk if uncertain
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If cases[].abuse_id is UNKNOWN → block Completeness Gate.
If cases[].steps[0] is UNKNOWN → block Completeness Gate.
If cases[].detection_signals is UNKNOWN → block Completeness Gate.
If cases[].mitigation_refs is UNKNOWN → block Completeness Gate.
If cases[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.TMA
Pass conditions:
required_fields_present == true
abuse_registry_defined == true
each_case_has_detection_and_mitigation == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

TMA-03

TMA-03 — Attack Surface Inventory (endpoints, clients, integrations)
Header Block

## 5. Optional Fields

Customer harm notes | OPTIONAL
Manual moderation workflow ref | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Each abuse case must link to at least one detection signal and one mitigation/control.
- Do not invent actor/asset IDs; use those defined in TMA-01 where possible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Abuse Cases (repeat per abuse_id)`
3. `## Abuse Case`
4. `## attack_steps:`
5. `## (Repeat per abuse case.)`
6. `## References`
7. `## Cross-References`
8. `## Skill Level Requiredness Rules`
9. `## beginner: Required. Define abuse registry and steps and one detection + mitigation per case.`
10. `## intermediate: Required. Add attacker/asset refs and residual risk rating and telemetry metric.`

## 8. Cross-References

- **Upstream: {{xref:TMA-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:TMA-04}}, {{xref:TMA-05}} | OPTIONAL**
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
