SYS-07 — Compliance & Gate Model (Hardened Draft)
1) Purpose
Define how Axion prevents drift: gates are the enforcement mechanism that blocks progression until artifacts are valid, consistent, and auditable.
This document defines:
what a gate is
where gates occur
what gate outcomes look like
what “override” means (and what it must record)

2) Gate Definition (locked)
A Gate is a deterministic pass/fail check applied to an artifact or stage output.
A gate must specify:
Target (what artifact/output is being checked)
Rules (what must be true)
Failure output (issues with pointers)
Severity (hard stop vs warning)
Allowed remediation (how it can be fixed)
Override policy (whether bypass is possible)

3) Gate Types (locked)
GATE-01 Schema Gate (Intake Validity)
Checks submissions against the Intake Schema:
required fields
types/enums/formats
dependencies (if X then Y)
skill-level thresholds
Hard stop if failing.
GATE-02 Normalization Gate (Transform Integrity)
Checks that normalization:
did not invent content
recorded changes in a normalization report
produced schema-consistent types and canonical naming
Hard stop if invention or invalid types; warnings allowed for minor cleanup.
GATE-03 Standards Gate (Resolved Ruleset Integrity)
Checks standards snapshot:
version pinned
defaults + overrides recorded
fixed vs configurable flags set
conflicts resolved or explicitly blocked
Hard stop if unresolved conflicts.
GATE-04 Spec Gate (Truth Integrity)
Checks canonical spec:
stable IDs exist
referential integrity (no broken references)
no duplicate truth
unknowns explicit and indexed
Hard stop if broken references or duplicate truth.
GATE-05 Planning Gate (Work Breakdown Integrity)
Checks work breakdown:
each unit maps to spec IDs
dependency graph is acyclic
units are within size discipline (not “whole app in one unit”)
Hard stop if missing mappings or cycles; warnings for size discipline if you allow.
GATE-06 Acceptance Gate (Proof Completeness)
Checks acceptance map:
every unit has acceptance items
hard gates defined
proof types and verification instructions present
Hard stop if any unit lacks hard-gate acceptance.
GATE-07 Template Gate (Filled Doc Completeness)
Checks filled templates:
required fields populated (or valid UNKNOWN policy)
no contradictions inside doc
cross-references resolve to canonical spec IDs
template completeness gate passes
Hard stop if required fields missing or contradictions.
GATE-08 Packaging Gate (Kit Contract)
Checks kit:
file tree contract satisfied
manifest/index present and correct
version stamps present
N/A rule followed (no silent omissions)
Hard stop if contract violated.
GATE-09 Execution Gate (Proof & Completion)
Checks build progress:
acceptance items pass
proofs recorded and linked
state snapshot updated
Hard stop for completion claim without proof.

4) Gate Output Contract (what a gate returns)
Every gate produces a report:
gate_id
target_artifact_id
status (pass/fail)
issues[]:
issue_id
severity (error/warning)
rule_id (which rule failed)
pointer (field_path/template section/unit_id)
message
remediation (what to change)
timestamp

5) Override Model (controlled bypass)
Overrides are allowed only if policy permits.
An override must record:
override_id
gate_id and failing rule_id
who/what approved (user/maintainer/system policy)
reason
risk_acknowledged
timestamp
downstream impacts (optional but recommended)
Rule: overrides never delete the original failure; they annotate it.

6) “No Forward Progress Without Compliance” (system enforcement)
If a hard stop gate fails, pipeline must stop.
If a warning gate fails, pipeline may continue but must record warnings in:
kit manifest
state snapshot (if execution phase)

7) Failure Modes prevented
moving forward with missing or contradictory requirements
producing kits with silent omissions
claiming completion without proof
untracked bypass decisions

8) Definition of Done
SYS-07 is complete when:
all gate types map to stages in SYS-03
output contract is consistent across all gates
override model is unambiguous and auditable

