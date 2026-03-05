# LTS-09 — Logging Verification (tests, scanners)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-09                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring logging verification (tests, scanners)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Logging Verification (tests, scanners) Document                         |

## 2. Purpose

Define the canonical verification approach that ensures logging standards are followed: tests for
required fields, scanners for secrets/PII, validation for structured logging, and CI gating rules.
This template prevents log regressions and sensitive data leakage.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Logging standard: {{xref:LTS-01}} | OPTIONAL
- Redaction standard: {{xref:LTS-04}} | OPTIONAL
- Telemetry schema: {{xref:OBS-02}} | OPTIONAL
- Security gates (SAST/SCA/secret scan): {{xref:CICD-04}} | OPTIONAL
- Release quality gates: {{xref:QA-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Verification layers (unit/integration/e2e)
Structured logging validation rule (JSON parse + schema)
Required field checks (OBS-02/LTS-01)
Secret/PII scanning rule (LTS-04 denylist)
Snapshot/contract tests for log events (OBS-05)
CI gate rule (block merges on failures)
Allowed exceptions process (how waived)
Telemetry requirements (verification failures rate)
Ownership (who maintains scanners/tests)
Runbook for failed gates

Optional Fields
Staging canary validation | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
CI must block on secret/PII leakage detection.
Verification should be deterministic; avoid flaky scans.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Layers
layers: {{layers.list}}
2. Structured Validation
schema_rule: {{validate.schema_rule}}
parser_rule: {{validate.parser_rule}} | OPTIONAL
3. Required Field Checks
fields_rule: {{fields.rule}}
required_fields: {{fields.required_fields}} | OPTIONAL
4. Scanning
denylist_ref: {{xref:LTS-04}} | OPTIONAL
scanner_rule: {{scan.scanner_rule}}
false_positive_rule: {{scan.false_positive_rule}} | OPTIONAL
5. Contract Tests
log_event_catalog_ref: {{xref:OBS-05}} | OPTIONAL
contract_test_rule: {{contract.rule}}
6. CI Gate
ci_gate_rule: {{ci.rule}}
pipeline_ref: {{xref:CICD-04}} | OPTIONAL
7. Exceptions
waiver_rule: {{exceptions.waiver_rule}}
exceptions_ref: {{xref:COMP-08}} | OPTIONAL
8. Telemetry
verification_fail_metric: {{telemetry.verification_fail_metric}}
9. Ownership
owner: {{owner.team}}
10.Runbook
failure_runbook: {{runbook.failure_runbook}}
Cross-References
Upstream: {{xref:LTS-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:QA-07}}, {{xref:SEC-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define layers, scanner rule, CI gate rule, runbook.
intermediate: Required. Define contract tests, exceptions, ownership, telemetry.
advanced: Required. Add staging canary validation and strict false-positive handling and waiver
governance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, parser rule, required fields list, denylist
ref, false positive rule, pipeline ref, exceptions ref, open_questions, staging canary
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If layers.list is UNKNOWN → block Completeness Gate.
If scan.scanner_rule is UNKNOWN → block Completeness Gate.
If ci.rule is UNKNOWN → block Completeness Gate.
If telemetry.verification_fail_metric is UNKNOWN → block Completeness Gate.
If runbook.failure_runbook is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
verification_layers_defined == true
scanning_defined == true
ci_gate_defined == true
runbook_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LTS-10

LTS-10 — Logging Runbooks (common issues)
Header Block

## 5. Optional Fields

Staging canary validation | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **CI must block on secret/PII leakage detection.**
- **Verification should be deterministic; avoid flaky scans.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Layers`
2. `## Structured Validation`
3. `## Required Field Checks`
4. `## Scanning`
5. `## Contract Tests`
6. `## CI Gate`
7. `## Exceptions`
8. `## Telemetry`
9. `## Ownership`
10. `## Runbook`

## 8. Cross-References

- **Upstream: {{xref:LTS-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:QA-07}}, {{xref:SEC-07}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define layers, scanner rule, CI gate rule, runbook.**
- **intermediate: Required. Define contract tests, exceptions, ownership, telemetry.**
- **advanced: Required. Add staging canary validation and strict false-positive handling and waiver**
- governance.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, parser rule, required fields list, denylist**
- ref, false positive rule, pipeline ref, exceptions ref, open_questions, staging canary
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If layers.list is UNKNOWN → block

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
