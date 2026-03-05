# SEC-04 — Vulnerability Management (patching, scans, SLAs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-04                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring vulnerability management (patching, scans, slas)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Vulnerability Management (patching, scans, SLAs) Document                         |

## 2. Purpose

Define the canonical vulnerability management program for the product: scanning, triage, patch
SLAs by severity, dependency management, and verification/closure workflow. This template
must be consistent with Secure SDLC gates and compliance control expectations.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security requirements baseline: {{xref:SEC-03}} | OPTIONAL
- Secure SDLC policy: {{xref:SEC-07}} | OPTIONAL
- Control matrix: {{xref:COMP-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Severity model (critic... | spec         | Yes             |
| Patch SLA by severity ... | spec         | Yes             |
| Ownership rules (who f... | spec         | Yes             |
| Dependency update poli... | spec         | Yes             |
| Exception/waiver rules... | spec         | Yes             |
| Verification requireme... | spec         | Yes             |
| Reporting cadence (wee... | spec         | Yes             |

## 5. Optional Fields

Coordinated disclosure policy | OPTIONAL
Asset inventory linkage | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
SLA must be explicit and enforceable.
Exceptions must have expiries and approvals.
Verification must be recorded (evidence pointer).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Sources
sources: {{vuln.sources}}
2. Severity Model
model: {{severity.model}}
definitions: {{severity.definitions}} | OPTIONAL
3. Patch SLAs
critical_days: {{sla.critical_days}}
high_days: {{sla.high_days}}
med_days: {{sla.med_days}}
low_days: {{sla.low_days}} | OPTIONAL
4. Triage Workflow
steps:
{{workflow.steps[0]}}
{{workflow.steps[1]}}
{{workflow.steps[2]}} | OPTIONAL
5. Ownership
fix_owner_rule: {{owners.fix_owner_rule}}
risk_acceptance_owner: {{owners.risk_acceptance_owner}} | OPTIONAL
6. Dependency Policy
sca_required: {{deps.sca_required}}
update_policy: {{deps.update_policy}}
blocked_severity_threshold: {{deps.blocked_severity_threshold}} | OPTIONAL
7. Exceptions
exceptions_ref: {{xref:SEC-08}} | OPTIONAL
waiver_rules: {{exceptions.waiver_rules}} | OPTIONAL
8. Verification
verification_required: {{verify.required}}
evidence_required: {{verify.evidence_required}}
9. Reporting
cadence: {{report.cadence}}
report_location: {{report.location}} | OPTIONAL
10.Telemetry
open_vulns_metric: {{telemetry.open_vulns_metric}}
sla_breach_metric: {{telemetry.sla_breach_metric}} | OPTIONAL
11.References
Security baseline: {{xref:SEC-03}} | OPTIONAL

Secure SDLC: {{xref:SEC-07}} | OPTIONAL
Compliance controls: {{xref:COMP-02}} | OPTIONAL
Cross-References
Upstream: {{xref:SEC-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SEC-05}}, {{xref:SEC-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define sources, SLAs, and workflow steps; mark UNKNOWN where tooling
is unknown.
intermediate: Required. Define ownership, dependency policy, and verification evidence.
advanced: Required. Add threshold gating, reporting rigor, and telemetry/SLA breach monitoring
detail.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, low SLA, extra workflow
steps, risk acceptance owner, blocked threshold, waiver rules, report location, optional telemetry
metrics, disclosure/asset linkage, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If vuln.sources is UNKNOWN → block Completeness Gate.
If sla.critical_days is UNKNOWN → block Completeness Gate.
If workflow.steps[0] is UNKNOWN → block Completeness Gate.
If verify.evidence_required is UNKNOWN → block Completeness Gate.
If telemetry.open_vulns_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SEC
Pass conditions:
required_fields_present == true
sla_defined == true
workflow_defined == true
verification_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SEC-05

SEC-05 — Incident Response Plan (detect, contain, recover)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **SLA must be explicit and enforceable.**
- **Exceptions must have expiries and approvals.**
- **Verification must be recorded (evidence pointer).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Sources`
2. `## Severity Model`
3. `## Patch SLAs`
4. `## Triage Workflow`
5. `## steps:`
6. `## Ownership`
7. `## Dependency Policy`
8. `## Exceptions`
9. `## Verification`
10. `## Reporting`

## 8. Cross-References

- **Upstream: {{xref:SEC-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-05}}, {{xref:SEC-09}} | OPTIONAL**
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
