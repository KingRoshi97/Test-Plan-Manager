GOV-02 — Change Control Rules
(Hardened Draft — Full)
1) Purpose
Define the strict process and rules for changing Axion system assets so evolution is controlled, auditable, and compatible with existing kits. This prevents “junkyard growth” and silent drift.
GOV-02 governs changes to:
SYS/ORD/GOV/EXEC contracts
intake form/schema/rules
canonical model
standards library
template library
kit contracts

2) Inputs
Versioning policy (GOV-01)
System boundaries (SYS-10), especially “no uncontrolled evolution”
Traceability model (SYS-06)
Gate model (SYS-07) and Gate DSL (ORD-02/03)

3) Outputs
A change control process that produces:
a recorded change request
an impact assessment
version bumps (as required)
compatibility notes/migrations when breaking
a governance gate pass report

4) Change Control Invariants (must always be true)
No untracked edits: system assets cannot be modified without a change record.
Versioning required: any change that affects behavior/output must bump versions per GOV-01.
Breaking changes require migration: no breaking change without GOV-03 artifacts.
Read-only runs: normal kit generation runs must treat system assets as read-only (SYS-10).
Auditability: every change must have who/why/what/when recorded.

5) Change Classes (Locked)
CC-01 Documentation-only (advisory text)
Clarifications that do not change behavior, contracts, or gating.
Requires: change record + doc version bump if doc is LOCKED.
CC-02 Contract change (structure/format)
Changes to schemas, template contracts, kit layout, manifest schema, gate DSL.
Requires: version bump + compatibility notes; often breaking.
CC-03 Rule change (behavioral)
Changes to validation thresholds, selection rules, standards precedence, gate logic.
Requires: version bump; may be breaking depending on output impact.
CC-04 Library change (standards/templates)
Adding/removing/modifying template or standards packs.
Requires: library version bump + updated indexes.
CC-05 Model evolution (canonical spec)
Changes to entity shapes, references, unknown model.
Requires: canonical model version bump + migration policy (GOV-03).

6) Required Change Record (Locked Fields)
Every change must have a record containing:
change_id
change_class (CC-01..CC-05)
scope (which surfaces are impacted: SYS/INT/CAN/STD/TMP/KIT/ORD/PLAN/VER/STATE)
summary
rationale
proposed_by
approved_by
created_at
approved_at
files_changed[] (paths)
versions_bumped[] (what and new values)
breaking_change (boolean)
compatibility_notes_ref (required if breaking)
migration_ref (required if breaking model/kit/schema)
risk_assessment (what might break)

7) Approval Rules (Who can approve what)
LOCKED contracts (SYS, ORD, KIT, CAN model rules) require maintainer approval.
Library changes (STD/TMP) require maintainer approval.
Advisory docs can be approved by maintainer or delegated role (policy-defined).
Rule: external agent cannot approve system changes.

8) Governance Gates (Must Pass Before Release)
Before a change becomes active, run governance gate checks:
GOV2-GATE-01 Version bump check
all impacted surfaces have required version bumps per GOV-01.
GOV2-GATE-02 Index update check
if STD or TMP changed, corresponding index/registry updated.
GOV2-GATE-03 Compatibility check (breaking)
compatibility notes present and complete
migration guidance present (if required)
GOV2-GATE-04 No self-modifying behavior
confirm the change does not enable system assets to be mutated during normal runs.
If any gate fails → change is rejected.

9) Release Discipline (How changes become active)
A change becomes active only when:
change record exists and is approved
required version bumps are applied
governance gate report is PASS
changelog updated

10) Failure Modes
“quick edits” without change record → drift
version not bumped → outputs change silently
breaking change without migration → old kits unusable
ambiguous approvals → unauthorized modifications

11) Definition of Done (GOV-02)
GOV-02 is complete when:
change classes are defined
required change record fields are locked
approval rules are explicit
governance gates are explicit and map to GOV-01 triggers
activation rules prevent untracked changes

