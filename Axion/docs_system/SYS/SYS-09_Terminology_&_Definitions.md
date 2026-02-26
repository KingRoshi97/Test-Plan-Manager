SYS-09 — Terminology & Definitions (Post-Completion Update)
1) Purpose
Provide the single authoritative glossary for Axion so all internal docs, gates, and kit artifacts use consistent meaning. SYS-09 is the canonical reference for terms used across SYS/INT/CAN/STD/TMP/ORD/PLAN/VER/KIT/STATE/GOV/EXEC.

2) Core Terms (expanded to match finished doc set)
Axion
System that converts user intent into an execution-ready Agent Kit by producing canonical truth artifacts, enforcing standards, and blocking progress via gates.
Internal Agent
Runs Axion. Generates artifacts and the kit; enforces gates; must not build product code; must not modify system assets during normal runs.
External Agent
Builds the product using the Agent Kit. Must follow work breakdown + acceptance map; must log proof; must update state snapshot.
System Update Mode
Maintainer-controlled mode where system assets (templates/standards/contracts/models) may be changed with change control, versioning, and compatibility notes (GOV-01..04). Not permitted during normal kit generation.
Kit Generation Mode
Default mode. Produces an Agent Kit from a submission using pinned versions; system assets are read-only.

3) Artifact & Contract Terms
Intake Form (INT-01)
User-facing pages/fields and conditional modules that collect project info.
Intake Schema (INT-02)
Formal validity contract: field paths, types, base constraints, enums. Does not contain conditional requiredness logic.
Validation Rules (INT-03)
Conditional requiredness, thresholds, dependencies, and reference integrity rules.
Submission Record (INT-04)
Immutable stored raw submission + metadata + version stamps + upload refs.
Validation Result (INT-05)
Standard pass/fail output: issues include rule_id + field_path + error_code.
Canonical Spec (CAN-01)
Single authoritative product truth model with entities, constraints, unknowns, and indexes/cross-maps.
ID & Reference Rules (CAN-02)
Rules for stable IDs, uniqueness, reference-by-ID discipline, allowed edges, referential integrity, and no duplicate truth.
Unknown (CAN-03)
First-class object representing missing/ambiguous/contradictory information; includes blocking policy and resolution requirements.
Standards Library (STD-01)
Versioned store of declarative rules organized into packs with applies_when filters and fixed vs configurable flags.
Standards Resolver (STD-02)
Deterministic rules for selecting packs, ordering them, merging conflicts, and applying/denying overrides.
Resolved Standards Snapshot (STD-03)
Project-specific, version-pinned resolved ruleset emitted into the kit; conflict-free; includes applied/blocked overrides.
Template Library / Template Index (TMP-01)
Versioned template inventory registry (template_index.json) listing templates, applicability, requiredness, inputs, outputs, dependencies.
Template File Contract (TMP-02)
Required template structure + placeholder syntax + allowed sources + unknown block format.
Template Selection (TMP-03)
Deterministic selection of templates based on routing and gate flags; produces selected/omitted lists with reasons and ordering.
Template Fill Rules (TMP-04)
Deterministic placeholder resolution from canonical artifacts; derived inserts; standards injection; unknown creation policy.
Template Completeness Rules (TMP-05)
Template Gate pass/fail rules: structure, resolved placeholders, reference integrity, no invention, standards compliance, skill-level requiredness.
Build Order Graph (ORD-01)
Doc/artifact dependency graph + valid topological build order + critical path; must be acyclic.
Gate DSL / Gate Rules (ORD-02)
Minimal deterministic rule language for expressing compliance checks and generating gate reports.
Per-Doc Gate Checklist (ORD-03)
Standard per-doc gate checklist format using the gate DSL; maps DoD to enforceable checks.
Work Breakdown (PLAN-01)
Ordered work units with unit_ids, scope_refs (spec IDs), dependencies, deliverables, risk flags.
Acceptance Map (PLAN-02)
Acceptance criteria per unit with hard/soft gating and proof requirements; links acceptance_id ↔ unit_id ↔ scope_refs.
Sequencing Heuristics (PLAN-03)
Allowed deterministic tie-breakers for ordering eligible work units; dependencies always dominate.
Proof (VER-01)
Acceptable evidence types (command output/test result/screenshot/log excerpt/diff ref/checklist) with required metadata and linkage.
Verification Command Policy (VER-02)
Rules for when/how checks must be run; capture requirements; failure handling; acceptance linkage.
Completion Criteria (VER-03)
Global rules for unit completion and project completion based on hard-gate acceptance + proof + no blocking unknowns.
Agent Kit (KIT-01)
Portable deliverable with locked folder structure, required root files, core artifacts, pack folders, and N/A stubs.
Manifest / Index (KIT-02)
00_KIT_MANIFEST.md contains authoritative JSON mapping IDs→paths and reading order; 00_KIT_INDEX.md mirrors it for humans.
Entrypoint (KIT-03)
00_START_HERE.md single start file; defines execution loop; declares truth sources; prohibits skipping/proofless claims.
Version Stamping (KIT-04)
00_VERSIONS.md includes machine-readable JSON of pinned versions for system, intake, standards, templates, model, planning, proof, kit contracts.
State Snapshot (STATE-01)
Machine-readable continuity record: unit_status, acceptance_status, proof_refs, blockers, unknown statuses, last-known-good, history/events.
Resume Rules (STATE-02)
Deterministic procedure to restart work using artifacts and state snapshot; no chat-memory authority.
Handoff Rules (STATE-03)
What must be recorded before switching agents/sessions and how the receiving agent resumes deterministically.
Versioning Policy (GOV-01)
What is versioned and when versions must bump; breaking vs non-breaking definitions.
Change Control (GOV-02)
Required change record, approval rules, governance gates, and activation rules for system updates.
Deprecation & Migration (GOV-03)
Deprecation records, replacement mappings, migration guides, compatibility notes required for breaking changes.
Audit / Traceability Rules (GOV-04)
Enforceable provenance requirements for artifacts, versions, proofs, and system changes; defines audit failure conditions.
Internal Agent Runbook (EXEC-01)
Deterministic end-to-end procedure internal agent follows to produce artifacts + kit and enforce gates.
External Agent Prompt Template (EXEC-02)
Standard builder-agent prompt that enforces truth sources, execution loop, proof/state discipline, and stop conditions.
Failure Handling Playbook (EXEC-03)
Standardized blocker/gate failure handling, what to record, and how to request missing input.

4) Consistency Rules (how terms must be used)
“Canonical Spec” is the only product truth model.
“Template” is guidance output and must not redefine truth.
“Gate” implies deterministic pass/fail with a gate report and rule_id.
“Override” implies a recorded before/after + approval + timestamp.
“Proof” must link to acceptance_id and unit_id; otherwise it is not proof.
“Manifest JSON is authoritative” for paths; index mirrors it.

5) Definition of Done (SYS-09 update)
SYS-09 is complete when:
every term used as a title or key concept in the finalized doc set appears here
GOV-04 naming is consistent (“Audit / Traceability Rules”)
no duplicate/conflicting definitions exist across docs (SYS-09 wins)


