# APIG-03 — Deprecation & Sunset Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | APIG-03                                             |
| Template Type     | Architecture / API Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring deprecation & sunset policy    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Deprecation & Sunset Policy Document                         |

## 2. Purpose

Define how APIs are deprecated and sunset: timelines, communication requirements,
redirect/compatibility strategies, deprecation headers, and enforcement rules. This prevents
surprise breakage and makes migration predictable.

## 3. Inputs Required

- ● APIG-02: {{xref:APIG-02}} | OPTIONAL
- ● REL-02: {{xref:REL-02}} | OPTIONAL
- ● RELOPS-01: {{xref:RELOPS-01}} | OPTIONAL
- ● SUP-03: {{xref:SUP-03}} | OPTIONAL
- ● STK-04: {{xref:STK-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Deprecation stages (an... | spec         | Yes             |
| Timeline policy (minim... | spec         | Yes             |
| Technical mechanisms:     | spec         | Yes             |
| ○ deprecation headers     | spec         | Yes             |
| ○ warning logs/metrics    | spec         | Yes             |
| ○ compatibility shims ... | spec         | Yes             |
| ○ redirects (if applic... | spec         | Yes             |
| Client detection and r... | spec         | Yes             |
| ○ how to identify usag... | spec         | Yes             |
| ○ reporting cadence       | spec         | Yes             |
| Approval requirements ... | spec         | Yes             |
| Exceptions policy         | spec         | Yes             |

## 5. Optional Fields

● Customer-specific contracts (enterprise SLAs) | OPTIONAL
● Notes | OPTIONAL

Rules
● Sunsetting requires prior announcement and measurable usage monitoring.
● Breaking clients must have a migration path documented.
● Deprecation must be tracked in changelog/version notes (REL).
● Exceptions must be time-bound.

Output Format
1) Deprecation Stages (required)
stag
e

meaning

minimum_duratio
n

signals

anno
unce

{{stages.announce.
meaning}}

{{stages.announce. {{stages.announc
duration}}
e.signals}}

warn

{{stages.warn.mea
ning}}

{{stages.warn.dura
tion}}

{{stages.warn.sign {{stages.warn.enforce
als}}
ment}}

restri
ct

{{stages.restrict.me
aning}}

{{stages.restrict.du
ration}}

{{stages.restrict.si
gnals}}

{{stages.restrict.enfor
cement}}

suns
et

{{stages.sunset.me
aning}}

{{stages.sunset.dur {{stages.sunset.si
ation}}
gnals}}

{{stages.sunset.enfor
cement}}

2) Timeline Policy (required)
● Minimum lead time for announce: {{timeline.announce_lead}}
● Warn duration: {{timeline.warn_duration}}
● Sunset minimum total window: {{timeline.total_min_window}}

3) Communication Requirements (required)
● Required channels: {{comms.channels}}

enforcement
{{stages.announce.en
forcement}}

● Required artifacts (release notes, docs): {{comms.artifacts}}
● Support macros pointer: {{xref:SUP-03}} | OPTIONAL

4) Technical Mechanisms (required)
● Deprecation headers: {{tech.headers}}
● Warning metrics/logs: {{tech.metrics_logs}}
● Compatibility shims: {{tech.shims}} | OPTIONAL
● Redirect rules: {{tech.redirects}} | OPTIONAL

5) Usage Monitoring & Reporting (required)
● Usage detection method: {{usage.detection}}
● Reporting cadence: {{usage.cadence}}
● Thresholds to proceed to sunset: {{usage.thresholds}} | OPTIONAL

6) Approval & Exceptions (required)
● Sunset approval required by: {{approval.required_by}}
● Decision log pointer: {{xref:STK-04}} | OPTIONAL
● Exceptions allowed when: {{exceptions.when}}
● Time-bound exception rule: {{exceptions.time_bound}}

Cross-References
● Upstream: {{xref:APIG-02}} | OPTIONAL, {{xref:REL-02}} | OPTIONAL
● Downstream: {{xref:APIG-04}}, {{xref:APIG-05}} | OPTIONAL, {{xref:RELOPS-04}} |
OPTIONAL

● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Stages + timeline + communication requirements.
● intermediate: Required. Add technical mechanisms and usage reporting.
● advanced: Required. Add thresholds, approvals, and exception governance.

Unknown Handling
● UNKNOWN_ALLOWED: enterprise_contracts, notes, redirect_rules,
shims
● If timeline policy is UNKNOWN → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.APIG
● Pass conditions:
○ required_fields_present == true
○ stages_present == true
○ timeline_present == true
○ comms_present == true
○ monitoring_present == true
○ approvals_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

APIG-04

APIG-04 — Review Gate Checklist (what
must be true before shipping APIs)
Header Block
● template_id: APIG-04
● title: Review Gate Checklist (what must be true before shipping APIs)
● type: api_governance_versioning
● template_version: 1.0.0
● output_path: 10_app/api_governance/APIG-04_Review_Gate_Checklist.md
● compliance_gate_id: TMP-05.PRIMARY.APIG
● upstream_dependencies: ["

## 6. Rules

- Sunsetting requires prior announcement and measurable usage monitoring.
- Breaking clients must have a migration path documented.
- Deprecation must be tracked in changelog/version notes (REL).
- Exceptions must be time-bound.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Deprecation Stages (required)`
2. `## stag`
3. `## meaning`
4. `## minimum_duratio`
5. `## signals`
6. `## anno`
7. `## unce`
8. `## meaning}}`
9. `## duration}}`
10. `## e.signals}}`

## 8. Cross-References

- Upstream: {{xref:APIG-02}} | OPTIONAL, {{xref:REL-02}} | OPTIONAL
- Downstream: {{xref:APIG-04}}, {{xref:APIG-05}} | OPTIONAL, {{xref:RELOPS-04}} |
- OPTIONAL
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
