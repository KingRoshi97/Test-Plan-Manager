# RLIM-03 — Abuse Signals & Detection Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-03                                             |
| Template Type     | Build / Rate Limiting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring abuse signals & detection rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Abuse Signals & Detection Rules Document                         |

## 2. Purpose

Define the canonical abuse signal catalog and detection rule format used to identify abusive or
anomalous behavior across rate-limited surfaces. This template must be consistent with the
global rate limit policy and must not invent enforcement capabilities beyond what upstream
inputs allow.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Signal registry (signa... | spec         | Yes             |
| Detection rules (rule_... | spec         | Yes             |
| Rule predicates/thresh... | spec         | Yes             |
| Evaluation window (tim... | spec         | Yes             |
| Scope keys (per ip/use... | spec         | Yes             |
| Trigger criteria (what... | spec         | Yes             |
| False-positive handlin... | spec         | Yes             |
| Severity levels (low/m... | spec         | Yes             |
| Action binding pointer... | spec         | Yes             |

## 5. Optional Fields

Per-surface rule sets | OPTIONAL
Per-endpoint-class rules | OPTIONAL

ML/anomaly detection notes | OPTIONAL
Manual review workflow | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- **Header Block**
- **template_id: RLIM-03**
- **title: Abuse Signals & Detection Rules**
- **type: abuse_signals_detection**
- **template_version: 1.0.0**
- **output_path: 10_app/ratelimits/RLIM-03_Abuse_Signals_Detection_Rules.md**
- **compliance_gate_id: TMP-05.PRIMARY.RLIM**
- **upstream_dependencies: ["RLIM-01"]**
- **inputs_required: ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX",**
- **"RLIM-01"]**
- **required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}**
- **Purpose**
- **Define the canonical abuse signal catalog and detection rule format used to identify abusive or**
- **anomalous behavior across rate-limited surfaces. This template must be consistent with the**
- **global rate limit policy and must not invent enforcement capabilities beyond what upstream**
- **inputs allow.**
- **Inputs Required**
- **SPEC_INDEX: {{spec.index}}**
- **DOMAIN_MAP: {{domain.map}} | OPTIONAL**
- **GLOSSARY: {{glossary.terms}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **RLIM-01 Rate Limit Policy: {{rlim.policy}}**
- **Existing docs/notes: {{inputs.notes}} | OPTIONAL**
- **Required Fields**
- **Signal registry (signal_id catalog)**
- **Signal definitions (what is measured, units, where captured)**
- **Detection rules (rule_id catalog)**
- **Rule predicates/threshold model (static/baseline/UNKNOWN)**
- **Evaluation window (time window)**
- **Scope keys (per ip/user/org/project/token)**
- **Trigger criteria (what constitutes a hit)**
- **False-positive handling notes**
- **Evidence capture requirements (what logs/metrics prove rule fired)**
- **Severity levels (low/med/high/critical)**
- **Action binding pointer (maps to RLIM-04 actions matrix)**
- **Observability requirements (rule hit rate, top keys, alerting)**
- **Optional Fields**
- **Per-surface rule sets | OPTIONAL**
- **Per-endpoint-class rules | OPTIONAL**
- **ML/anomaly detection notes | OPTIONAL**
- **Manual review workflow | OPTIONAL**
- **Open questions | OPTIONAL**
- **Rules**
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not define enforcement actions here; bind to {{xref:RLIM-04}}.
- **Rules MUST be deterministic and evaluable from captured signals (no “human judgment”**
- **predicates).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Cardinality controls MUST be respected for labels/keys (no unbounded identifiers unless**
- **allowed).**

## 7. Output Format

### Required Headings (in order)

1. `## Signal Registry (by signal_id)`
2. `## Signal`
3. `## (edge/middleware/app/broker/UNKNOWN)`
4. `## (Repeat for each signal_id.)`
5. `## Detection Rules (by rule_id)`
6. `## Rule`
7. `## (per_ip/per_user/per_org/per_project/per_token/UNKNOWN)`
8. `## open_questions:`
9. `## (Repeat for each rule_id.)`
10. `## Evidence Capture Requirements`

## 8. Cross-References

- **Upstream: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

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
