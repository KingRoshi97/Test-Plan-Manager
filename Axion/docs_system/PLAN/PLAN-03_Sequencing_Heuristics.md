PLAN-03 — Sequencing Heuristics (Foundational First, Vertical Slices, etc.)
(Hardened Draft — Full)
1) Purpose
Define the allowed sequencing heuristics the planner may use to order work units, while staying deterministic and aligned to dependencies.
PLAN-03 does not replace hard dependency rules (PLAN-01). It defines tie-breakers and ordering principles when multiple valid sequences exist.

2) Inputs
Work Breakdown (units + dependency graph)
Canonical Spec (feature priorities, workflows)
Resolved Standards Snapshot (foundational constraints)
Delivery preferences (priority bias: speed/balanced/quality)

3) Outputs
An ordered units[] list in the Work Breakdown
Optional: sequencing_notes (why an order was chosen)

4) Sequencing Invariants (must always be true)
Dependencies first: no unit can be scheduled before its prerequisites.
Deterministic ties: tie-breakers must be stable (no randomness).
Early validation: prefer sequences that produce early verifiable checkpoints.
Risk isolation: handle high-risk foundations before dependent feature work.

5) Sequencing Heuristics (Locked Set)
H-01 Foundations First (hard preference)
After setup, schedule foundational units early:
security foundation (if auth/permissions)
data foundation (if data.enabled)
quality foundation (always)
ops foundation (if required)
Purpose: avoid feature work built on unstable foundations.

H-02 Vertical Slices Over Horizontal Layers (default)
Prefer completing a small end-to-end feature slice (UI + API + data + checks) before building many unrelated layers.
Example:
complete “Task CRUD” end-to-end before building “All screens” then “All endpoints.”

H-03 Follow Priority Rank for Must-Haves
Order feature-slice units by:
must-have priority rank (from canonical spec)
Tie-breakers:
lower dependency fan-in first (simpler features earlier)
higher user value first (if captured)

H-04 Reduce Rework (stabilize interfaces early)
If multiple units depend on shared contracts:
schedule the contract-defining units early:
API contract docs (if present)
data model foundations
permission model definitions

H-05 Risk-Based Ordering
High-risk units should occur earlier when they unblock large work:
auth/session implementation
migration-heavy changes
external integrations with unknowns
But not before prerequisites.

H-06 Optimize for Verification Cadence
Prefer sequences that regularly produce proof:
early build/test/lint passing
early smoke workflows
early acceptance passes

H-07 Delivery Preference Modifier (speed vs quality)
Use delivery.priority_bias to modify tie-breakers only (never override dependencies):
Speed: favor smallest verifiable slice first, defer non-critical hardening
Balanced: standard ordering (foundations → vertical slices → polish)
Quality: bring forward additional checks, hardening, and regression coverage earlier

6) Deterministic Tie-Breaker Order (Locked)
When two units are both eligible (all deps satisfied), order them by:
Unit category order:
setup → foundations → contract units → feature slices → integrations → polish/ops
Must-have priority rank (if unit maps to a must-have feature)
Risk flag priority (auth/data_migration/integration higher first)
Smaller scope_refs count first (simpler first)
Lexical order of unit_id (final deterministic tie-breaker)

7) Failure Modes
planner invents a custom heuristic per project (non-deterministic)
tie-breakers depend on agent mood/context (drift)
speed bias causes skipping required foundations (violates PLAN-01 hard constraints)
ordering produces long stretches without verification (late failure discovery)

8) Definition of Done (PLAN-03)
PLAN-03 is complete when:
allowed heuristic set is locked
dependency precedence is explicit
tie-breaker order is deterministic and explicit
delivery preference only modifies tie-breakers, not dependencies

