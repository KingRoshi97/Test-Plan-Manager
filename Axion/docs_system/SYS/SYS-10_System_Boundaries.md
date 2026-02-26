SYS-10 — System Boundaries (Hardened Draft)
1) Purpose (Expanded + Hardened)
1.1 Purpose Statement (locked)
SYS-10 exists to define hard boundaries for Axion so the internal agent cannot expand scope implicitly. These boundaries are enforced through gates, overrides, and versioning rules so the system remains:
Stable: behavior doesn’t change run-to-run without a recorded version change


Non-bloated: new “helpful” behaviors don’t accumulate as untracked features


Predictable: every action the internal agent takes is authorized by system docs


Auditable: boundary decisions are traceable and reviewable


Deterministic: same inputs + same versions produce the same outputs and constraints


1.2 What this document controls (authority)
SYS-10 is a system law document. It controls:
internal agent behavior limits (what actions are prohibited)


pipeline scope limits (what stages can and cannot do)


what belongs in kits vs what does not


what requires change control versus normal configuration


SYS-10 supersedes any “helpful” behavior found elsewhere if there is conflict.
1.3 Why SYS-10 exists (failure prevention)
This document exists to prevent these specific system failure classes:
Scope Creep Drift


internal agent begins doing extra work “to be helpful” (e.g., generating code, inventing requirements, deciding stack choices not authorized)


Junkyard Growth


repeated small additions create inconsistent and messy repo/system behavior (new docs, new rules, new exceptions with no governance)


Hidden Assumption Injection


internal agent fills gaps silently, producing kits that cannot be audited or reproduced


Contract Erosion


internal agent bypasses gates, changes file layout, or shifts responsibilities between internal/external agents without recorded decision and versioning


User Trust Breakage


users can’t tell what Axion guarantees, what it does, or why outputs changed


1.4 Enforcement Requirement (non-negotiable)
Every boundary in SYS-10 must have an enforcement mechanism:
Gate enforcement: Packaging Gate / Template Gate / Spec Gate / etc. must fail on violations


Override enforcement: if any boundary can ever be bypassed, the bypass must require an override record


Version enforcement: boundary changes require versioning + change control


Rule: A boundary without enforcement is not a boundary. It must be treated as incomplete.
1.5 Output of SYS-10 (what it enables)
SYS-10 enables:
strict internal-agent operating constraints (“what it must never do”)


a clean separation between internal manufacturing vs external building


a stable baseline for governance: change control can only act on defined boundaries


consistent maintenance: the system can evolve without accumulating contradictions


1.6 Definition of Done (for Section 1)
Section 1 is complete when:
it explicitly states SYS-10’s authority and enforcement requirement


it defines the failure classes SYS-10 prevents


it states that boundaries must be tied to gates/overrides/versioning


it contains no ambiguous language (“should,” “usually,” “ideally”) in any enforceable claim

SYS-10 — Section 2) Axion Boundaries (Locked)
Below is the hardened version of Section 2. I’m keeping your boundary list exactly, but upgrading each boundary into enforceable law: scope, prohibitions, gate enforcement, override policy, and pass/fail checks.

B-01 Axion does not build the product (Hardened)
Boundary statement: Axion manufactures the Agent Kit; the external agent builds the software.
B-01.1 Allowed outputs (Axion may produce)
truth artifacts (normalized input, standards snapshot, canonical spec, work breakdown, acceptance map, initial state snapshot)
filled templates (guidance only)
packaging artifacts (kit structure, manifest/index, entrypoint, version stamps)
validation and gate reports
proof requirements and proof formats (not proofs)
B-01.2 Prohibited actions (Axion must not)
produce product source code as “deliverables”
claim feature implementation is complete
“test-run” the target product build
make ad-hoc implementation decisions not derived from standards or user inputs
B-01.3 Enforcement (hard gate)
KIT Packaging Gate must fail if:
code deliverables exist beyond explicitly allowed scaffolding policy, OR
any doc claims build completion, OR
acceptance/proof requirements are missing
Issue format: SYS10-B01-VIOLATION with file path pointers
B-01.4 Override policy
Not overridable. This is a system boundary.
B-01.5 Pass/Fail checklist
Kit contains no implementation deliverables (unless explicitly allowed scaffolding and labeled).
No docs claim “implemented” work.
Work Breakdown + Acceptance Map exist and are referenced from entrypoint.

B-02 Axion does not invent requirements (Hardened)
Boundary statement: Axion never guesses missing requirements.
B-02.1 Allowed handling of missing info (only)
explicit UNKNOWN with impact and blocking flag
gate failure requiring user input
B-02.2 Prohibited actions
inferring features, entities, roles, permissions, workflows, constraints not provided
filling placeholders with “reasonable assumptions” without marking UNKNOWN
creating “default requirements” beyond the resolved standards snapshot
B-02.3 Enforcement (hard gates)
Normalization Gate fails if it introduces non-traceable new requirements
Spec Gate fails if canonical spec contains invented objects not traceable to normalized input or standards snapshot
Template Gate fails if required placeholders are filled with invented content rather than UNKNOWN
B-02.4 Override policy
Overridable only by explicit user decision as new input, not as a validator bypass.
i.e., you can update the submission; you cannot “override” invention.
B-02.5 Pass/Fail checklist
Every non-trivial requirement traces to submission or standards snapshot.
Unknowns are explicit, indexed, and never silently resolved.

B-03 Axion does not replace human intent (Hardened)
Boundary statement: Axion cannot decide priorities/scope/brand identity beyond captured intent.
B-03.1 Allowed actions
structure and normalize user input
apply standards defaults where permitted
ask for resolution when intent is missing/contradictory (via gate failures)
B-03.2 Prohibited actions
inventing business priorities or scope tradeoffs
redefining “success” beyond user definition
generating brand identity beyond user-provided direction for consumer-facing products
B-03.3 Enforcement (gates)
Spec Gate fails if it introduces scope/priorities not in input
Template Gate fails if PRD/Design templates contain “decisions” not traceable
Decision Log requirement: any discretionary choice must be marked as a decision with source and rationale (and may be blocked depending on policy)
B-03.4 Override policy
Overridable only by user-provided inputs or approved overrides in configurable areas.
B-03.5 Pass/Fail checklist
Priorities, success criteria, and scope are identical to user inputs unless explicitly overridden and logged.
Consumer-facing brand direction exists or is explicitly UNKNOWN (and treated per gates).

B-04 Axion does not override locked rules silently (Hardened)
Boundary statement: Deviations from fixed contracts/resolved standards require explicit override.
B-04.1 Prohibited actions
changing any locked contract (kit tree, canonical spec schema, gate rules) without change control
applying user preferences that conflict with fixed standards silently
B-04.2 Enforcement (hard gates)
Standards Gate fails if an override is applied without:
field_path
before/after
source
permission check
timestamp
Packaging Gate fails if version stamps don’t record standards/template/system versions
B-04.3 Override policy (strict)
Overrides must include:
override_id, field_path, before, after, reason, approved_by, approved_at, permission_basis
B-04.4 Pass/Fail checklist
All overrides are recorded and permission-validated.
No silent changes exist between snapshot and output docs.

B-05 Axion does not guarantee correctness of external execution (Hardened)
Boundary statement: Axion guarantees kit quality/traceability, not external implementation correctness.
B-05.1 What Axion guarantees
acceptance criteria exist for each work unit
proof requirements exist for each acceptance criterion
verification commands and/or verification procedures are specified
B-05.2 What Axion must not claim
“the build works”
“the feature is implemented”
“tests pass”
unless accompanied by proof artifacts produced during execution (external phase)
B-05.3 Enforcement
Completion Gate fails if state snapshot marks unit done without passing hard-gate acceptance + proof refs.
Report Gate fails if completion report contains claims without referenced proof IDs.
B-05.4 Pass/Fail checklist
Completion claims always reference proof IDs.
Proof IDs map to acceptance IDs and unit IDs.

B-06 Axion does not handle production operations by default (Hardened)
Boundary statement: Ops is included only when required by scope/routing.
B-06.1 Allowed behavior
include Ops templates and constraints when:
project requires deployment/runtime operations, OR
user explicitly asks for ops coverage, OR
preset implies operational complexity
B-06.2 Prohibited behavior
generating heavy ops requirements for simple builds without need
running deployments or managing infrastructure
B-06.3 Enforcement
Template Selection Gate must justify inclusion/exclusion of ops templates.
Ops slot must be either filled or 00_NA.md (no silent omission).
B-06.4 Pass/Fail checklist
Ops coverage is present only when justified, otherwise N/A with reason.
No deployment execution occurs inside Axion.

B-07 Axion does not store “hidden state” as truth (Hardened)
Boundary statement: Only recorded artifacts are authoritative; no implicit memory.
B-07.1 Authoritative state sources (only)
submission record
validation report
normalized input
standards snapshot
canonical spec
work breakdown
acceptance map
kit manifest/index
state snapshot + proof log
B-07.2 Prohibited behavior
relying on agent conversation memory as authoritative
making decisions based on “prior runs” without recorded state snapshot links
storing untracked state in ad-hoc notes
B-07.3 Enforcement
Traceability Gate fails if an artifact references an untracked dependency (“as discussed” with no ID link).
Resume Gate fails if current run cannot be reconstructed from stored artifacts.
B-07.4 Pass/Fail checklist
Every decision references an artifact ID, not conversational history.
State snapshot is the only continuity anchor.

B-08 Axion does not permit uncontrolled evolution (Hardened)
Boundary statement: System changes require change control and versioning.
B-08.1 Prohibited behavior
editing templates/standards/contracts without version bump
changing kit layout without compatibility notes
breaking older kits without migration policy
B-08.2 Enforcement
Governance Gate fails if:
a locked artifact changes without changelog entry
version registry not updated
compatibility notes missing when required
B-08.3 Pass/Fail checklist
Every change has a version bump and changelog entry.
Compatibility notes exist for breaking changes.
Old kits remain interpretable via pinned versions.

Section 3) Allowed Extensions (Rewritten + Extra Hardened)
3.0 Non-Negotiable Rule: No Self-Modifying Runs
During normal Agent Kit generation, the internal agent must treat all system assets as read-only:
Template Library


Standards Library


Gate rules


Canonical Spec model/schema


Kit layout contracts


System Overview docs


If any of these change during a normal run: the run must fail immediately as a boundary violation.

3.1 Purpose
This section defines the only safe lanes for Axion to evolve between runs under explicit governance. It is a maintainer-controlled capability, not a runtime behavior.

3.2 When Extensions Are Allowed (only these contexts)
Extensions are allowed only when the system is explicitly in System Update Mode, meaning:
a maintainer has initiated an update operation


a new system version is being authored


changes will be versioned, reviewed, and recorded


Extensions are not allowed in:
normal kit generation mode


external agent execution mode


resume/handoff mode



3.3 Safe Extension Lanes (the only allowed change types)
E-01 Template Library Changes (add/modify/remove templates)
Allowed only if:
template has a single clear purpose


no duplicate truth (references Canonical Spec IDs)


required fields are fillable without guessing (UNKNOWN or gate fail)


completeness gate exists and is objective


Template Index updated


template library version bumped


compatibility notes written if any kit outputs change materially


E-02 Standards Library Changes (add/modify standards)
Allowed only if:
standards are versioned


fixed vs configurable is explicit per rule


resolution order is deterministic (defaults → presets → overrides → snapshot)


standards snapshot format remains compatible or has migration notes


standards library version bumped


compatibility notes written if outputs change


E-03 Gate Model Changes (add/modify gates)
Allowed only if:
gate is deterministic


gate target + rule IDs are explicit


gate report output contract is unchanged or versioned


override policy is explicit


change does not duplicate an existing gate unless it tightens enforcement


system version bumped


compatibility notes written if behavior changes


E-04 Canonical Spec Model Changes (schema evolution)
Allowed only if:
spec model version bumped


migration path exists (old → new mapping rules)


ID/reference invariants are preserved or explicitly migrated


impacted templates updated + versioned


compatibility notes written for old kits/specs



3.4 Enforcement Rules (must be true for any extension)
Any extension must produce:
version bump (system/library/schema as applicable)


changelog entry (what changed + why)


compatibility notes (what breaks/what migrates)


updated indexes/registries (template index, standards index, etc.)


a governance gate pass report confirming compliance


Rule: If any of these are missing, the extension is invalid.

3.5 Explicitly Disallowed Changes (unsafe growth)
Disallowed in all contexts:
self-modifying behavior during normal runs


unversioned edits to templates/standards/contracts


changes that introduce hidden state as truth


changes that allow guessing/invention as a fallback


changes that break the kit layout without migration/compat notes



3.6 Definition of Done (for Section 3)
Section 3 is complete when:
System Update Mode is explicitly the only place extensions occur


normal runs are explicitly read-only for system assets


each safe lane has enforceable requirements


unsafe changes are explicitly prohibited

Section 4) Boundary Violation Examples (Expanded + Hardened)
4.1 Purpose
This section defines concrete, unambiguous examples of what boundary violations look like in practice so the internal agent can detect them and gates can fail deterministically.
Rule: Every violation example must map to:
a boundary (B-01..B-08)


a gate that must fail (schema/spec/template/packaging/completion)


a required remediation action



4.2 Violation Examples (locked set)
V-01 Invented Features in Filled Templates
Boundary: B-02 (does not invent requirements) + B-03 (does not replace intent)
 Violation pattern: a filled template includes a feature/capability not present in Canonical Spec or user submission.
Concrete examples
PRD-03 lists “Team collaboration” but Canonical Spec has no such capability ID.


DES-04 includes a “Shared Calendar” screen not referenced by any workflow or feature.


IMP guide instructs building “push notifications” when not requested and not in standards snapshot as required.


Gate enforcement
Template Gate fails with:


rule_id: SYS10-V01-INVENTION


pointers to the template section and the missing canonical spec reference


Spec Gate must fail earlier if the invention entered the Canonical Spec.


Required remediation
Either:


mark as UNKNOWN (only if it is truly a missing requirement), or


remove the invented content, or


update intake input explicitly and re-run pipeline.



V-02 Progressing Past Failed Intake Validation
Boundary: B-04 (no silent override) + SYS-07 “No forward progress without compliance”
 Violation pattern: pipeline continues to normalization/spec/templates when intake validation failed.
Concrete examples
Validation report includes missing required fields but Normalized Input Record is generated anyway.


Intake schema thresholds not met (workflows/out-of-scope) but canonical spec is built.


Dependency rule violated (build_target=existing but repo link missing) but planner runs.


Gate enforcement
Intake Schema Gate is a hard stop. If failed:


pipeline must terminate and output validation issues.


Any downstream artifact created after a failed intake gate triggers:


rule_id: SYS10-V02-FORWARD-PROGRESS-WITH-FAIL


immediate run invalidation.


Required remediation
user corrects submission or provides missing info


revalidate successfully before continuing



V-03 Kit Layout Changed Without Version Bump + Compatibility Notes
Boundary: B-08 (no uncontrolled evolution) + configuration/versioning laws
 Violation pattern: kit file tree or required file placements change without version governance.
Concrete examples
00_START_HERE.md renamed or moved with no kit contract version bump.


01_core_artifacts/03_canonical_spec.json path changes without manifest contract update.


pack folder layout changed (e.g., 30_features/ renamed) and older kits become unreadable.


Gate enforcement
Packaging Gate fails with:


rule_id: SYS10-V03-UNVERSIONED-KIT-CONTRACT-CHANGE


pointers to violated required paths


Governance Gate fails if:


version registry not updated


compatibility notes missing


Required remediation
revert layout change, or


bump kit contract version + add compatibility notes + migration guidance



V-04 Allowing External Agent to Interpret Missing Constraints
Boundary: B-03 (does not replace intent) + B-07 (no hidden state)
 Violation pattern: kit contains ambiguous or missing constraints and instructs external agent to “decide” core requirements.
Concrete examples
Security templates say “choose an auth method” with no standards constraints and no user input.


Design templates say “pick a UI style” without any user direction or standards snapshot.


Implementation docs instruct “decide data model as needed” without canonical spec entities.


Gate enforcement
Template Gate fails if any required decision area is left as “agent decides” instead of:


resolved standard


explicit user requirement


explicit UNKNOWN (with gate behavior)


Spec Gate fails if canonical spec lacks required constrained decisions while downstream docs proceed.


Required remediation
capture the missing constraint via intake input or standards resolution


represent as UNKNOWN if allowed and non-blocking


regenerate affected artifacts



4.3 Additional Mandatory Violation Classes (to make this strict)
These are also boundary violations and must be treated as failures:
V-05 Silent Override (changes without override record)
Boundary: B-04


Gate: Standards Gate / Packaging Gate


V-06 Hidden State Reliance (“as discussed earlier” with no artifact reference)
Boundary: B-07


Gate: Traceability Gate


V-07 Proofless Completion Claims
Boundary: B-05


Gate: Completion Gate


V-08 Self-Modifying Run (libraries/contracts edited during kit generation)
Boundary: Section 3 (No self-modifying runs) + B-08


Gate: Governance Gate / Packaging Gate



4.4 Definition of Done (for Section 4)
Section 4 is complete when:
every violation maps to a boundary and a gate


each has a required remediation


violation patterns are concrete enough to detect automatically



Section 5) Definition of Done (Expanded + Hardened)
5.1 Purpose
Define what it means for SYS-10 to be complete, enforceable, and safe to lock as a system-law document.
Rule: SYS-10 cannot be considered “done” unless its boundaries are enforceable through gates, versioning rules, or explicit run-mode constraints.

5.2 Required Completion Conditions (must all be true)
DOD-01 Boundary Coverage Completeness
All boundaries B-01 through B-08 are present.


Each boundary includes:


prohibited actions


allowed behaviors (where relevant)


enforcement mechanism (gate + rule_id)


override policy (overridable vs non-overridable)


pass/fail checklist


Fail condition: any boundary lacks enforcement.

DOD-02 Enforcement Mapping Exists
For every boundary, SYS-10 must map to at least one enforcement point:
Intake/Schema Gate


Spec Gate


Template Gate


Packaging Gate


Completion/Proof Gate


Governance Gate


Traceability Gate


Each boundary must declare:
rule_id format: SYS10-B0X-* or SYS10-V0X-*


pointers required in gate reports (field_path / file_path / template_section / unit_id)


Fail condition: boundary exists only as narrative without a gate mapping.

DOD-03 Run-Mode Separation Is Explicit
SYS-10 must explicitly define:
Normal Kit Generation Mode = read-only system assets


System Update Mode = allowed extension lanes under change control


And must state:
any system-asset change during normal runs is a hard failure


Fail condition: ambiguity about when extensions are permitted.

DOD-04 Traceability Compliance
SYS-10 must align with SYS-06 by requiring:
no reliance on chat memory as truth


all decisions must reference artifact IDs


proof must link acceptance_id → unit_id → spec scope refs


Fail condition: any boundary implies “implicit memory” as acceptable.

DOD-05 Versioning & Compatibility Alignment
SYS-10 must require:
version pinning for kits (system/templates/standards/schema)


compatibility notes for breaking changes


prohibition of unversioned layout/contract changes


Fail condition: kit contract changes can occur without version bump + notes.

DOD-06 Concrete Violation Examples Included
SYS-10 must include a Boundary Violation Examples section where:
each example maps to a boundary + gate + remediation


examples are specific enough to be detected (not vague)


Fail condition: examples are too abstract to enforce.

DOD-07 No Conflicting Language
SYS-10 must not contain:
“should,” “usually,” “ideally” for enforceable statements


conflicting guidance with SYS-01 guarantees or SYS-07 gate model


Fail condition: any enforceable rule is expressed as optional.

5.3 Lock Criteria (when SYS-10 becomes LOCKED)
SYS-10 becomes LOCKED when:
all DOD conditions above are met


governance registry records SYS-10 version


change control policy marks SYS-10 as system-law


After lock:
changes require change control + version bump + changelog entry



5.4 Outputs of Completion (what “done SYS-10” enables)
Once complete, SYS-10 enables:
deterministic stopping conditions (no drift past boundaries)


safe system evolution (via System Update Mode only)


enforceable separation between internal manufacturing and external building



5.5 Definition of Done Checklist (short form)
B-01..B-08 expanded with enforcement + override policy + checklist


Each boundary mapped to a gate with rule IDs


Normal vs Update mode explicitly enforced


Traceability and proof linkage requirements align with SYS-06


Versioning/compatibility requirements align with governance


Concrete violation examples map to boundaries + remediation


No optional language in enforceable rules


SYS-10 marked LOCKED in version registry (once governance docs exist 
