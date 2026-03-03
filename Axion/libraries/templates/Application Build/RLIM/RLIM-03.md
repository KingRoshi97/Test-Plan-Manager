# RLIM-03 — Abuse Signals & Detection Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-03                                          |
| Template Type     | Build / Rate Limits                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring abuse signals & detection |
| Filled By         | Internal Agent                                   |
| Consumes          | RLIM-01                                          |
| Produces          | Filled Abuse Signals & Detection Rules           |

## 2. Purpose

Define the canonical abuse signal catalog and detection rule format used to identify abusive or anomalous behavior across rate-limited surfaces. This template must be consistent with the global rate limit policy and must not invent enforcement capabilities beyond what upstream inputs allow.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Signal registry (signal_id catalog) | spec | No |
| Signal definitions (what is measured, units, where captured) | spec | No |
| Detection rules (rule_id catalog) | spec | No |
| Rule predicates/threshold model (static/baseline/UNKNOWN) | spec | Yes |
| Evaluation window (time window) | spec | No |
| Scope keys (per ip/user/org/project/token) | spec | No |
| Trigger criteria (what constitutes a hit) | spec | No |
| False-positive handling notes | spec | No |
| Evidence capture requirements (what logs/metrics prove rule fired) | spec | No |
| Severity levels (low/med/high/critical) | spec | No |
| Action binding pointer (maps to RLIM-04 actions matrix) | spec | No |
| Observability requirements (rule hit rate, top keys, alerting) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Per-surface rule sets | spec | OPTIONAL |
| Per-endpoint-class rules | spec | OPTIONAL |
| ML/anomaly detection notes | spec | OPTIONAL |
| Manual review workflow | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not define enforcement actions here; bind to {{xref:RLIM-04}}.
- Rules MUST be deterministic and evaluable from captured signals (no "human judgment" predicates).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Cardinality controls MUST be respected for labels/keys (no unbounded identifiers unless allowed).

## 7. Cross-References

- **Upstream**: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN where signals/rules are not defined; do not invent action behavior. | Required. Define rule windows, predicates, and evidence requirements. | Required. Add cardinality controls, alerting thresholds, and false-positive handling rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, dimensions, pii_risk, notes, predicate_model, false_positive_handling, alerting, dashboards, alerts, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If rule_id or signal_id is UNKNOWN → block Completeness Gate.
- If action_ref is UNKNOWN → allow only if flagged in Open Questions.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.RLIM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] all signal_ids are unique
  - [ ] all rule_ids are unique
  - [ ] all action_refs (if present) point to RLIM-04
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

