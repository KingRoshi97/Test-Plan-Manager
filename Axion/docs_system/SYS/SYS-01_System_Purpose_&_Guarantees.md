SYS-01 — System Purpose & Guarantees
1) Purpose
Axion exists to convert a project idea into an execution-ready Agent Kit that can be used by an external build agent to produce working software with proof—not claims—while minimizing drift, contradictions, and missed requirements.
Axion is not “an agent.” Axion is the system that constrains and equips agents.

2) System Purpose (what Axion is trying to optimize)
Axion optimizes for:
Consistency: two runs of the same input + same versions should yield the same kit structure and constraints.
Completeness: the system should not miss standard senior-level project requirements (security, QA, data, ops where applicable).
Traceability: every output can be traced back to user-provided input and the resolved ruleset.
Execution-readiness: the kit must tell an agent exactly what to build, in what order, and how to verify.

3) Guarantees (non-negotiable)
Axion must guarantee the following:
G-01 No Creative Guessing
If required information is missing, Axion must:
mark it as UNKNOWN explicitly, or
fail validation / fail a gate (depending on the rule)
Axion must never invent requirements, data, or constraints.
G-02 Single Source of Truth
Axion must maintain one authoritative truth model per project (Canonical Spec).
Templates and plans must reference truth by ID, not rewrite it.
G-03 Deterministic Constraints
Axion must produce a Resolved Standards Snapshot that:
is self-contained
pins versions
records defaults + overrides
defines fixed vs configurable rules
G-04 Traceability Chain
Axion must preserve a provenance chain:
Intake Submission → Validation Result → Normalized Input → Canonical Spec → Work Breakdown → Acceptance Map → Kit Manifest → Proof Log pointers.
Every derived artifact must link to its inputs by ID.
G-05 No Forward Progress Without Compliance
Axion must not progress to downstream artifacts if upstream gates fail.
Compliance is enforced at these layers:
intake validity (schema)
template completeness
reference integrity
acceptance/proof requirements
G-06 Portable, Predictable Kit Output
Axion must output an Agent Kit with:
fixed file tree contract
manifest/index
entrypoint
version stamps
required artifacts included (or explicitly N/A with reason)

4) Success Criteria (how we know SYS-01 is true)
Axion is succeeding if:
external agent can build from kit without asking foundational questions
drift incidents are traceable to a specific missing/unknown or override
the kit can be audited (what rules were applied, what proofs exist)
repeated runs are structurally consistent

5) Failure Modes (what SYS-01 prevents)
kits that “look good” but don’t build
contradictory docs that cause agent confusion
hidden assumptions that later break the build
missing security/QA/ops requirements that should have been standard

6) Definition of Done (for SYS-01 doc)
SYS-01 is complete when:
all guarantees are explicit, testable, and unambiguous
terms used here are defined in SYS-09
guarantees map cleanly to the gate model (SYS-07) and artifact taxonomy (SYS-04)

