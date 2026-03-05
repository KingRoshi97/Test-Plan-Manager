# APIG-05 — Compatibility Test

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | APIG-05                                             |
| Template Type     | Architecture / API Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring compatibility test    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Compatibility Test Document                         |

## 2. Purpose

Define the minimum compatibility/contract test suite required to ship and evolve APIs without
breaking clients: schema checks, contract tests, backward-compat enforcement, and CI
requirements.

## 3. Inputs Required

- ● APIG-01: {{xref:APIG-01}} | OPTIONAL
- ● APIG-02: {{xref:APIG-02}} | OPTIONAL
- ● API-02: {{xref:API-02}} | OPTIONAL
- ● ERR-03: {{xref:ERR-03}} | OPTIONAL
- ● TINF-01: {{xref:TINF-01}} | OPTIONAL
- ● CICD-04: {{xref:CICD-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| Contract test categories: | spec         | Yes             |
| ○ schema compatibility... | spec         | Yes             |
| ○ error contract check... | spec         | Yes             |
| ○ authz contract check... | spec         | Yes             |
| ○ pagination/filtering... | spec         | Yes             |
| ○ versioning compatibi... | spec         | Yes             |
| Required CI execution ... | spec         | Yes             |
| Failure policy (block ... | spec         | Yes             |
| Test artifact requirem... | spec         | Yes             |

## 5. Optional Fields

● Golden files strategy | OPTIONAL
● Notes | OPTIONAL

Rules
● If applies == false, include 00_NA block only.
● Compatibility tests must run in CI for protected branches.
● Failing compatibility tests must block release.
● Schema diffs must be reviewed and approved when breaking.

Output Format
1) Applicability
● applies: {{compat_tests.applies}} (true/false)
● 00_NA (if not applies): {{compat_tests.na_block}} | OPTIONAL

2) Required Test Categories (required if applies)
category

require
d

description

tooling_hint

notes

schema_compat

true

{{tests.schema.des
c}}

{{tests.schema.toolin
g}}

{{tests.schema.note
s}}

error_contract

true

{{tests.error.desc}}

{{tests.error.tooling}}

{{tests.error.notes}}

authz_contract

true

{{tests.authz.desc}
}

{{tests.authz.tooling}}

{{tests.authz.notes}
}

pagination_filteri
ng

true

{{tests.pfs.desc}}

{{tests.pfs.tooling}}

{{tests.pfs.notes}}

versioning

true

{{tests.version.des
c}}

{{tests.version.toolin
g}}

{{tests.version.note
s}}

3) CI Execution Rules (required if applies)
● When run: {{ci.when}}

● Required branches: {{ci.branches}}
● Required environments: {{ci.envs}} | OPTIONAL
● Artifacts produced: {{ci.artifacts}}

4) Failure Policy (required if applies)
● Block merge on failure: {{policy.block_merge}}
● Block release on failure: {{policy.block_release}}
● Exception/waiver allowed: {{policy.waiver_allowed}} | OPTIONAL

5) Artifact Requirements (required if applies)
● Schema diff report: {{artifacts.schema_diff}}
● Contract test report: {{artifacts.test_report}}
● Evidence pointers stored: {{artifacts.evidence_store}} | OPTIONAL

Cross-References
● Upstream: {{xref:APIG-02}} | OPTIONAL, {{xref:API-02}} | OPTIONAL
● Downstream: {{xref:APIG-06}} | OPTIONAL, {{xref:QA-03}} | OPTIONAL,
{{xref:RELOPS-05}} | OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Not required.
● intermediate: Required if applies. Categories + CI rules + failure policy.

● advanced: Required if applies. Add artifact requirements and waiver controls.

Unknown Handling
● UNKNOWN_ALLOWED: golden_files, notes, waiver_allowed, envs
● If applies == true and CI rules are UNKNOWN → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.APIG
● Pass conditions:
○ required_fields_present == true
○ if_applies_then_categories_present == true
○ if_applies_then_ci_rules_present == true
○ failure_policy_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

APIG-06

APIG-06 — Schema Evolution Rules
(backward compatible changes,
migrations)
Header Block
● template_id: APIG-06
● title: Schema Evolution Rules (backward compatible changes, migrations)
● type: api_governance_versioning
● template_version: 1.0.0
● output_path: 10_app/api_governance/APIG-06_Schema_Evolution_Rules.md
● compliance_gate_id: TMP-05.PRIMARY.APIG
● upstream_dependencies: ["APIG-02", "DATA-04", "ERR-03"]
● inputs_required: ["APIG-02", "DATA-04", "ERR-03", "STK-04", "STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define the rules for evolving schemas safely (API request/response schemas and shared
models): what changes are backward compatible, how to stage migrations, how to deprecate
fields,

## 6. Rules

- If applies == false, include 00_NA block only.
- Compatibility tests must run in CI for protected branches.
- Failing compatibility tests must block release.
- Schema diffs must be reviewed and approved when breaking.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Required Test Categories (required if applies)`
3. `## category`
4. `## require`
5. `## description`
6. `## tooling_hint`
7. `## notes`
8. `## schema_compat`
9. `## true`
10. `## c}}`

## 8. Cross-References

- Upstream: {{xref:APIG-02}} | OPTIONAL, {{xref:API-02}} | OPTIONAL
- Downstream: {{xref:APIG-06}} | OPTIONAL, {{xref:QA-03}} | OPTIONAL,
- **{{xref:RELOPS-05}} | OPTIONAL**
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
