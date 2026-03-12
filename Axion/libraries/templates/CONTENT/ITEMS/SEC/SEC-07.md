# SEC-07 — Secure SDLC Policy (reviews, CI gates, dependencies)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-07                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring secure sdlc policy (reviews, ci gates, dependencies)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Secure SDLC Policy (reviews, CI gates, dependencies) Document                         |

## 2. Purpose

Define the canonical Secure SDLC policy for the product: required reviews, CI security gates,
dependency controls, secret scanning, and release requirements. This template must be
consistent with the baseline security controls and compliance evidence expectations.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security baseline controls: {{xref:SEC-03}} | OPTIONAL
- Compliance control matrix: {{xref:COMP-02}} | OPTIONAL
- Test plan: {{xref:TESTPLAN-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| SDLC stages covered (d... | spec         | Yes             |
| Required review types ... | spec         | Yes             |
| Branch protection rule... | spec         | Yes             |
| CI security gates list... | spec         | Yes             |
| Dependency policy (all... | spec         | Yes             |
| Secrets handling in SD... | spec         | Yes             |
| Pre-release checklist ... | spec         | Yes             |
| Release blocking crite... | spec         | Yes             |
| Evidence artifacts pro... | spec         | Yes             |
| Owner/custodian for SD... | spec         | Yes             |

## 5. Optional Fields

Threat model checkpoint (TMA) | OPTIONAL
Emergency hotfix process | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
CI gates must be enforceable and tied to branch protections.
Dependencies must be deterministic (lockfiles required).
Security gates must produce artifacts usable as evidence.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Stages Covered
stages: {{sdlc.stages}}
2. Reviews
required_reviews: {{reviews.required}}
security_review_trigger_rule: {{reviews.security_trigger_rule}} | OPTIONAL
3. Branch Protections
protected_branches: {{branch.protected_branches}}
required_checks: {{branch.required_checks}}
merge_requirements: {{branch.merge_requirements}} | OPTIONAL
4. CI Security Gates
gates: {{ci.gates}}
fail_conditions: {{ci.fail_conditions}}
artifact_outputs: {{ci.artifact_outputs}} | OPTIONAL
5. Dependency Policy
lockfiles_required: {{deps.lockfiles_required}}
allowed_registries: {{deps.allowed_registries}} | OPTIONAL
pinning_rule: {{deps.pinning_rule}}
vuln_threshold_block: {{deps.vuln_threshold_block}} | OPTIONAL
6. Secrets in SDLC
no_secrets_in_repo_rule: {{secrets.no_secrets_in_repo_rule}}
secret_scanning_required: {{secrets.scanning_required}}
7. Pre-Release Checklist
checklist: {{release.checklist}}
security_signoff_required: {{release.security_signoff_required}}
8. Release Blocking Criteria
block_when: {{release.block_when}}
9. Evidence
evidence_artifacts: {{evidence.artifacts}}
storage_location: {{evidence.storage_location}} | OPTIONAL
10.Ownership
policy_owner: {{owner.policy_owner}}
11.References
Security baseline: {{xref:SEC-03}} | OPTIONAL
Vulnerability mgmt: {{xref:SEC-04}} | OPTIONAL
Threat modeling: {{xref:TMA-01}} | OPTIONAL
Compliance matrix: {{xref:COMP-02}} | OPTIONAL

Cross-References
Upstream: {{xref:SEC-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SEC-09}}, {{xref:SEC-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define stages, basic reviews, and at least SAST/SCA/secret scan gates.
intermediate: Required. Define branch protections, fail conditions, and evidence artifacts.
advanced: Required. Add hotfix process, security trigger rules, and strict dependency
governance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, security trigger, merge requirements,
artifact outputs, allowed registries, vuln threshold, evidence storage, threat checkpoint, hotfix
process, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If ci.gates is UNKNOWN → block Completeness Gate.
If ci.fail_conditions is UNKNOWN → block Completeness Gate.
If deps.pinning_rule is UNKNOWN → block Completeness Gate.
If secrets.no_secrets_in_repo_rule is UNKNOWN → block Completeness Gate.
If owner.policy_owner is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SEC
Pass conditions:
required_fields_present == true
ci_gates_defined == true
branch_protections_defined == true
dependency_policy_defined == true
release_blocking_defined == true
evidence_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SEC-08

SEC-08 — Security Exceptions Process (approvals, expiries, audit)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **CI gates must be enforceable and tied to branch protections.**
- **Dependencies must be deterministic (lockfiles required).**
- **Security gates must produce artifacts usable as evidence.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Stages Covered`
2. `## Reviews`
3. `## Branch Protections`
4. `## CI Security Gates`
5. `## Dependency Policy`
6. `## Secrets in SDLC`
7. `## Pre-Release Checklist`
8. `## Release Blocking Criteria`
9. `## Evidence`
10. `## Ownership`

## 8. Cross-References

- **Upstream: {{xref:SEC-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-09}}, {{xref:SEC-08}} | OPTIONAL**
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
