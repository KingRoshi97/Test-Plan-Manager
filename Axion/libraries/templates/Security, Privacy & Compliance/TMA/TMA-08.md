# TMA-08 — Fraud/Payment Abuse Controls (ties to PAY-08)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-08                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring fraud/payment abuse controls (ties to pay-08)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Fraud/Payment Abuse Controls (ties to PAY-08) Document                         |

## 2. Purpose

Define the threat-model perspective on payment/fraud abuse: catalog the key fraud vectors,
required controls, monitoring signals, and escalation paths—anchored to the
implementation-level PAY-08 document. This template must not diverge from the actual
payments fraud controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Payments fraud controls: {{xref:PAY-08}} | OPTIONAL
- Payment flows: {{xref:PAY-02}} | OPTIONAL
- Abuse catalog: {{xref:TMA-02}} | OPTIONAL
- Abuse signals: {{xref:RLIM-03}} | OPTIONAL
- Enforcement actions: {{xref:RLIM-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Fraud vectors list (vector_id list)
vector_id (stable identifier)
Linked abuse_id/risk_id (if any)
Attack description
Impacted payment flows (PAY-02)
Controls required (PAY-08 refs)
Detection signals (metrics/logs)
Enforcement actions (block/review)
Escalation path (support/fraud team)
Telemetry requirements (fraud blocks, review outcomes)
Residual risk rating (high/med/low/UNKNOWN)

Optional Fields
Provider-specific fraud notes | OPTIONAL
Chargeback strategy pointer | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Every vector must map to at least one PAY-08 control and one detection signal.
Do not introduce new controls here; reference PAY-08 for implementation detail.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Vector Registry Summary
total_vectors: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Vectors (repeat per vector_id)
Vector
vector_id: {{vectors[0].vector_id}}
linked_abuse_id: {{vectors[0].linked_abuse_id}} | OPTIONAL
attack: {{vectors[0].attack}}
flows_impacted: {{vectors[0].flows_impacted}}
controls_ref: {{vectors[0].controls_ref}} (expected: {{xref:PAY-08}})
detection_signals: {{vectors[0].detection_signals}}
enforcement_actions: {{vectors[0].enforcement_actions}}
escalation_path: {{vectors[0].escalation_path}}
telemetry_metric: {{vectors[0].telemetry_metric}}
residual_risk: {{vectors[0].residual_risk}}
provider_notes: {{vectors[0].provider_notes}} | OPTIONAL
(Repeat per vector.)
3. References
Payments fraud controls: {{xref:PAY-08}} | OPTIONAL
Refunds/disputes: {{xref:PAY-06}} | OPTIONAL
Rate limit strategy: {{xref:TMA-06}} | OPTIONAL
Risk register: {{xref:TMA-04}} | OPTIONAL
Cross-References
Upstream: {{xref:PAY-08}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:TMA-04}}, {{xref:SEC-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define vectors, impacted flows, and at least one detection/enforcement per

vector.
intermediate: Required. Add escalation and telemetry and residual risk.
advanced: Required. Add provider notes and tighter linkage to abuse/risk IDs and chargeback
strategy pointers.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, linked abuse/risk ids, provider
notes, chargeback pointer, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If vectors[].vector_id is UNKNOWN → block Completeness Gate.
If vectors[].controls_ref is UNKNOWN → block Completeness Gate.
If vectors[].detection_signals is UNKNOWN → block Completeness Gate.
If vectors[].enforcement_actions is UNKNOWN → block Completeness Gate.
If vectors[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.TMA
Pass conditions:
required_fields_present == true
vectors_defined == true
each_vector_has_controls_and_detection == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

TMA-09

TMA-09 — Security Validation (tests, drills, red team-lite)
Header Block

## 5. Optional Fields

Provider-specific fraud notes | OPTIONAL
Chargeback strategy pointer | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every vector must map to at least one PAY-08 control and one detection signal.**
- Do not introduce new controls here; reference PAY-08 for implementation detail.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Vector Registry Summary`
2. `## Vectors (repeat per vector_id)`
3. `## Vector`
4. `## (Repeat per vector.)`
5. `## References`

## 8. Cross-References

- **Upstream: {{xref:PAY-08}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:TMA-04}}, {{xref:SEC-06}} | OPTIONAL**
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
