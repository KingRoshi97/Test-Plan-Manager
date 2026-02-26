SYS-02 — Operating Principles 
1) Purpose
Define the universal principles Axion must follow in every pipeline stage, across every artifact, to prevent drift and maintain senior-level consistency.
These principles are system rules, not suggestions.

2) Principles (locked)
P-01 Separation of Responsibilities (internal vs external)
Internal agent manufactures the kit (fills templates, enforces gates, produces truth artifacts).
External agent builds software using the kit.
The external agent should never need to reason about Axion internals; it should follow the kit.
P-02 Single Source of Truth
The Canonical Spec is the only place where product truth is defined.
All other docs must reference spec IDs; no redefining features/roles/workflows/data elsewhere.
P-03 Explicit Unknowns
Unknowns must be represented as explicit UNKNOWN items, not silently inferred.
Unknowns must be consolidated in a dedicated section in each doc that allows them.
Unknowns must be labeled with impact and blocking status.
P-04 Determinism
Given:
the same validated submission
the same template library version
the same standards library version
the same system version
…the outputs must be reproducible in structure and constraints.
P-05 “No Forward Progress Without Compliance”
Every stage has gates.
If a gate fails, the internal agent must stop and report failures with actionable pointers (field paths, template sections, rule IDs).
P-06 Traceability by Default
Every artifact must include:
IDs of upstream artifacts it depends on
version stamps for template/standards/system
a stable identifier for itself
P-07 Minimum Senior Coverage
The system must cover the senior-level build areas:
product scope, UX/UI, architecture, implementation, security, quality, ops (where applicable)
Missing a critical area is treated as a system failure, not a “nice-to-have omission.”
P-08 Constraint First, Creativity Last
Where the build requires decisions:
prefer resolved standards and explicit user constraints first
only then allow discretionary choices, and those must be documented as decisions
P-09 Controlled Evolution
System evolution must be governed:
versioned libraries
change control for locked contracts
compatibility notes for older kits

3) What these principles constrain (system-wide)
These principles constrain:
normalization behavior
standards resolution behavior
spec building behavior
template filling behavior
planning/decomposition behavior
verification/proof behavior
kit packaging behavior

4) Failure Modes these principles prevent
duplicating truth across docs
agent improvisation due to missing constraints
inconsistent outputs across runs
silent drift from untracked changes
un-auditable builds

5) Definition of Done
SYS-02 is complete when:
each principle is enforceable via SYS-07 (gates) or via artifact schema/contract rules
no principle overlaps redundantly with SYS-01 guarantees (SYS-01 = what must be true; SYS-02 = how we operate to keep it true)
terms are defined in SYS-09
