SYS-04 — Artifact Taxonomy (Hardened Draft)
1) Purpose
Define the complete set of Axion artifacts as a parts list, categorized by what they are and how they are used, so the internal agent always knows:
what artifacts must exist
which are raw vs derived vs canonical
which are reusable libraries vs project-specific outputs

2) Taxonomy Categories (locked)
T-01 Intake Assets (raw inputs + validity boundary)
Artifacts that capture and validate user intent.
Intake Form (user-facing)
Intake Schema (valid submission contract)
Intake Submission Record (raw, immutable)
Intake Validator Output (pass/fail + issues)
Property: raw/traceable; not “truth model,” just input boundary.

T-02 Core Data Artifacts (project truth objects)
Artifacts that become the system’s internal and kit-delivered truth.
Normalized Input Record
Resolved Standards Snapshot
Canonical Spec
Work Breakdown
Acceptance Map
State Snapshot
Property: project-specific; version-stamped; referenced by IDs.

T-03 Libraries (reusable stores)
Reusable assets used across projects.
Template Library
Standards Library
Vocabulary/Definitions Library
Example/Reference Library (optional)
Property: versioned; selected and pinned per project.

T-04 Generators (transforms that produce artifacts)
System processes that manufacture artifacts.
Normalizer
Standards Resolver
Spec Builder
Planner/Decomposer
Acceptance Mapper
Template Selector
Template Filler
Packager
Property: deterministic transforms; gated.

T-05 Kit Deliverable (handoff package)
Portable, predictable output package.
Agent Kit folder (structured)
Zipped kit
Entrypoint document
Kit manifest/index
Version stamp document
Property: must satisfy layout contract; external-agent facing.

T-06 Verification Assets (proof system)
Artifacts that define and store proof.
Verification plan/checklist
Proof log
Commands list / verification policy
Completion report format
Property: prevents “claims without evidence.”

T-07 Control Assets (stability over time)
Artifacts that keep the system stable and evolvable.
Version registry
Changelog
Compatibility notes
Lock rules / change control rules
Property: governs evolution without junkyard growth.

3) Artifact Properties (how to classify any artifact)
Every artifact must declare:
Type category (T-01..T-07)
Mutability (immutable / append-only / regenerable)
Authority level
raw input / normalized / canonical / derived / library / contract
Version stamps required fields
Upstream dependencies
Downstream consumers

4) What artifacts are “authoritative truth”
Only these are authoritative truth objects:
Canonical Spec
Resolved Standards Snapshot
Work Breakdown
Acceptance Map
State Snapshot (truth of progress, not product)
Everything else must reference these, not redefine them.

5) Failure Modes prevented by this taxonomy
treating templates as truth (causes contradictions)
mixing raw submission with normalized/canonical data
unversioned standards drifting across runs
kits missing required authoritative artifacts

6) Definition of Done
SYS-04 is complete when:
every artifact used in the pipeline is mapped into exactly one taxonomy category
“authoritative truth artifacts” are explicitly identified and enforced
this doc aligns with SYS-03 stage outputs and SYS-07 gating model
