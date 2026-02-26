SYS-05 — Roles & Responsibilities (Hardened Draft)
1) Purpose
Define who does what in Axion so responsibility boundaries are explicit and the system does not rely on implied behavior. This prevents drift caused by role confusion.

2) Primary Actors (locked)
R-01 User (Project Owner)
Responsibilities
Provide accurate project intent via intake form
Provide required artifacts (uploads/links) when applicable
Resolve blocking unknowns when gates require it
Approve overrides that change locked constraints (if allowed)
What the user can trust
The kit reflects what they submitted + resolved standards snapshot
The system will surface missing/contradictory inputs as validation/gate failures

R-02 Internal Agent (Axion Runner)
Responsibilities
Execute the pipeline stages deterministically:
validate submission
normalize input
resolve standards
build canonical spec
generate work breakdown + acceptance map
select and fill templates
package agent kit
Enforce gates:
stop on failures
produce actionable errors referencing field paths/template sections/rule IDs
Preserve traceability:
version stamps
IDs linking upstream artifacts to downstream artifacts
What the internal agent must never do
invent requirements
silently fix contradictions
proceed past a failed gate without a recorded override decision

R-03 External Agent (Builder)
Responsibilities
Read the kit entrypoint and follow the documented build order
Execute work units and satisfy acceptance/proof requirements
Record proof artifacts (command output, screenshots, logs) into the proof log
Update state snapshot (or provide the data required to update it)
What the external agent must never do
deviate from locked constraints without generating a decision record
claim completion without proof artifacts

3) System Owner / Maintainer (optional but recommended)
R-04 Maintainer (Axion Maintainer)
Responsibilities
Manage versions of templates, standards, vocab
Approve system changes under change control
Maintain compatibility notes and migrations

4) Handoff Boundaries (what can be trusted at each boundary)
Boundary B-01: Validated Submission
Trust: schema compliance, dependencies satisfied, profile thresholds met
Do not trust: that input is “complete enough” for a perfect build—unknowns may remain
Boundary B-02: Canonical Spec
Trust: single truth model with stable IDs and referential integrity
Do not trust: that unknowns are resolved—unknowns must remain explicit
Boundary B-03: Agent Kit
Trust: contains all required artifacts and filled docs per layout contract
Do not trust: that external agent will follow it unless verified through proofs
Boundary B-04: Completion
Trust: only if acceptance criteria and proof requirements are met and logged

5) Failure Modes prevented by clear roles
internal agent acting like a creative builder
external agent improvising because kit is incomplete
user expecting system to infer missing requirements silently

6) Definition of Done
SYS-05 is complete when:
responsibilities and “must never do” constraints are explicit for each actor
handoff boundaries define what is trusted and what is not
roles align with SYS-03 stage ownership and SYS-07 gating model
