GOV-04 — Audit / Traceability Rules
(Hardened Draft — Full)
1) Purpose
Define the audit rules that ensure Axion outputs are fully traceable and reviewable. This document turns SYS-06 “traceability model” into enforceable governance requirements across:
intake → spec → plan → templates → kit → proof → completion
system evolution (changes, versions, migrations)

2) Inputs
Traceability model (SYS-06)
Gate model (SYS-07) + Gate DSL (ORD-02/03)
Version stamping rules (KIT-04)
Deprecation/migration rules (GOV-03)
Proof system rules (VER-01/02/03)

3) Outputs
A set of locked audit requirements that:
specify what must be recorded
specify minimum metadata and linkage
define audit failure conditions (what breaks auditability)

4) Audit Invariants (must always be true)
End-to-end provenance exists: every derived artifact links to its upstream inputs.
Single authoritative mapping: manifest/index + version stamps make the kit navigable and reproducible.
Decisions are recorded: overrides/decisions/blockers are recorded with IDs and timestamps.
Proof links to acceptance: no completion claim without acceptance-linked proof.
Change history is recorded: system updates are traceable through change records, versions, and migrations.

5) Required Audit Records (Locked)
5.1 Project Run Audit Spine (must exist per kit)
The kit must include and link:
submission_id + schema/form versions (INT-04)
validation result (INT-05 stored or referenced)
normalized input record
resolved standards snapshot
canonical spec
work breakdown
acceptance map
kit manifest/index
versions file
state snapshot
proof log
Rule: missing any of these breaks auditability.
5.2 Gate Reports (recommended; required for strict mode)
For each stage gate (intake/spec/template/packaging/completion):
store gate report or include pointers to it
include rule_ids + pointers + timestamps
5.3 Overrides / Decisions / Blockers (required if any occur)
If any override/decision occurs, it must be recorded in:
standards snapshot overrides section (for standards overrides)
state snapshot overrides/decisions (for execution decisions)
change control record (for system updates)

6) Linkage Rules (must always be true)
GOV4-LINK-01 Artifact linkage
Every artifact must include:
submission_id
its own id (spec_id, work_breakdown_id, etc.)
upstream ids (where applicable)
GOV4-LINK-02 Proof linkage
Every proof entry must include:
proof_id → acceptance_id → unit_id
and acceptance_id must exist in acceptance map.
GOV4-LINK-03 Manifest linkage
Every important artifact path must appear in manifest JSON:
core artifacts
proof log
key filled docs
and must physically exist.
GOV4-LINK-04 Version linkage
Versions recorded in:
00_VERSIONS.md
00_KIT_MANIFEST.md
resolved_standards_snapshot.json
must agree.

7) Audit Failure Conditions (hard fails)
Audit is considered failed if:
any core artifact is missing
any required id link is missing or inconsistent
proof references are broken
unit marked done without proof for hard gates
versions mismatch across manifest/snapshot/versions
system changes lack change record/version bump when applicable

8) Audit Output (what an audit should be able to answer)
A valid audit must be able to answer:
What did the user submit (raw)?
What ruleset was applied (standards snapshot)?
What is the canonical truth model (spec)?
What work was planned (work breakdown)?
What proved it was done (acceptance + proof)?
What changed over time (state snapshot events)?
What versions produced this kit (versions file)?
If something differs from another run, which version changed?

9) Failure Modes
kits exist but cannot be reproduced due to missing versions
“done” status is narrative without proof
decisions made in chat and not recorded
compatibility changes shipped without traceable migrations

10) Definition of Done (GOV-04)
GOV-04 is complete when:
required audit records are enumerated
linkage rules are explicit and enforceable
audit failure conditions are explicit
version consistency requirements align with KIT-04
proof and completion linkage requirements align with VER-03

