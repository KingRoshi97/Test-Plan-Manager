# DATA-04 — Migration Plan (schema

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-04                                             |
| Template Type     | Data / Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring migration plan (schema    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Migration Plan (schema Document                         |

## 2. Purpose

Define the deterministic plan for evolving the database schema safely: migration sequencing,
expand/contract approach, backfills, verification steps, and rollback posture. This prevents
breaking running systems and supports mixed-version deployments.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DATA-02: {{xref:DATA-02}} | OPTIONAL
- ● DATA-03: {{xref:DATA-03}} | OPTIONAL
- ● APIG-06: {{xref:APIG-06}} | OPTIONAL
- ● REL-04: {{xref:REL-04}} | OPTIONAL
- ● SBDT-06: {{xref:SBDT-06}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Migration philosophy (... | spec         | Yes             |
| Migration categories:     | spec         | Yes             |
| ○ additive (safe)         | spec         | Yes             |
| ○ backfill required       | spec         | Yes             |
| ○ destructive (breaking)  | spec         | Yes             |
| Migration runbook (hig... | spec         | Yes             |
| ○ create migration        | spec         | Yes             |
| ○ apply in stage          | spec         | Yes             |
| ○ verify                  | spec         | Yes             |
| ○ apply in prod           | spec         | Yes             |
| For each planned migra... | spec         | Yes             |
| ○ mig_id                  | spec         | Yes             |

## 5. Optional Fields

● Tooling (Drizzle/Prisma/etc) notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Destructive migrations require explicit approval and a rollback/roll-forward plan.
- Backfills must be resumable and observable.
- All migrations must include verification steps.
- Migration steps must align with deployment constraints (SBDT-06).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Migration Philosophy (required)`
2. `## 2) Migration Runbook (required)`
3. `## 3) Migration Registry (canonical)`
4. `## descr`
5. `## iption`
6. `## tables`
7. `## catego`
8. `## steps`
9. `## backfil`
10. `## verific`

## 8. Cross-References

- Upstream: {{xref:APIG-06}} | OPTIONAL, {{xref:SBDT-06}} | OPTIONAL
- Downstream: {{xref:REL-04}} | OPTIONAL, {{xref:BDR-03}} | OPTIONAL, {{xref:QA-05}} |
- OPTIONAL
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
