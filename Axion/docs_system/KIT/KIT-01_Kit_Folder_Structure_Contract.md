KIT-01 — Kit Folder Structure Contract
(Hardened Draft — Full)
1) Purpose
Define the locked folder/file structure of the Agent Kit so:
every kit is predictable and machine-navigable
the external agent always knows where to find truth artifacts, filled docs, and proof/state
packaging can be validated via a deterministic gate (no silent omissions)
the kit remains stable across versions (changes require version stamping + compatibility notes)

2) Inputs
Kit file tree standard (locked)
Core artifacts (A2): normalized input, standards snapshot, canonical spec, work breakdown, acceptance map, state snapshot
Filled templates (TMP outputs)
Pack hierarchy model (App → Domain → Feature → Screen → Component)
Traceability requirements (SYS-06)

3) Outputs
A kit folder that:
conforms to the structure below
includes required root files
includes required core artifacts
includes filled docs in standardized placement
includes pack folders (domain/feature/screen/component) as needed
includes N/A stubs where applicable (no silent absence)

4) Locked Kit Root Structure
agent_kit/
├── 00_START_HERE.md
├── 00_KIT_MANIFEST.md
├── 00_KIT_INDEX.md
├── 00_VERSIONS.md
├── 00_RUN_RULES.md
├── 00_PROOF_LOG.md
│
├── 01_core_artifacts/
│   ├── 01_normalized_input_record.json
│   ├── 02_resolved_standards_snapshot.json
│   ├── 03_canonical_spec.json
│   ├── 04_work_breakdown.json
│   ├── 05_acceptance_map.json
│   └── 06_state_snapshot.json
│
├── 10_app/
│   ├── 00_pack_meta.md
│   ├── 00_pack_index.md
│   ├── 00_gate_checklist.md
│   ├── 01_requirements/
│   ├── 02_design/
│   ├── 03_architecture/
│   ├── 04_implementation/
│   ├── 05_security/
│   ├── 06_quality/
│   ├── 07_ops/
│   ├── 08_data/
│   ├── 09_api_contracts/
│   ├── 10_release/
│   ├── 11_governance/
│   └── 12_analytics/
│
├── 20_domains/
│   └── <domain_slug>/
│       ├── 00_pack_meta.md
│       ├── 00_pack_index.md
│       ├── 00_gate_checklist.md
│       └── <slot folders...>
│
├── 30_features/
│   └── feat_<feature_slug>/
│       ├── 00_pack_meta.md
│       ├── 00_pack_index.md
│       ├── 00_gate_checklist.md
│       └── <slot folders...>
│
├── 40_screens/
│   └── scr_<screen_slug>/
│       ├── 00_pack_meta.md
│       ├── 00_pack_index.md
│       ├── 00_gate_checklist.md
│       └── <slot folders...>
│
└── 50_components/
    └── cmp_<component_slug>/
        ├── 00_pack_meta.md
        ├── 00_pack_index.md
        ├── 00_gate_checklist.md
        └── <slot folders...>


5) Required Root Files (Locked)
5.1 00_START_HERE.md (required)
single entrypoint for external agent
must reference:
manifest/index
canonical spec
work breakdown + acceptance map
proof log + state snapshot
5.2 00_KIT_MANIFEST.md (required)
IDs → paths mapping and kit metadata (KIT-02 defines format)
5.3 00_KIT_INDEX.md (required)
human-readable table of contents (mirrors manifest)
5.4 00_VERSIONS.md (required)
pinned versions (KIT-04 defines format)
5.5 00_RUN_RULES.md (required)
minimal execution rules:
“no claims without proof”
update state snapshot
follow work breakdown order unless blocked
5.6 00_PROOF_LOG.md (required)
proof record surface (VER-01 contract)

6) Core Artifacts Folder (01_core_artifacts) — Required Contents
These files are required in every kit (no exceptions):
01_normalized_input_record.json
02_resolved_standards_snapshot.json
03_canonical_spec.json
04_work_breakdown.json
05_acceptance_map.json
06_state_snapshot.json
Rule: missing any core artifact is a Packaging Gate failure.

7) Pack Folder Contract (Applies to 10_app and all pack folders)
7.1 Pack Root Files (required)
Every pack folder must include:
00_pack_meta.md
00_pack_index.md
00_gate_checklist.md
7.2 Slot Folder Set (required to exist)
Every pack must include the full slot folder set:
01_requirements/
02_design/
03_architecture/
04_implementation/
05_security/
06_quality/
07_ops/
08_data/
09_api_contracts/
10_release/
11_governance/
12_analytics/
7.3 N/A Rule (no silent omission)
If a slot has no applicable filled templates, it must contain:
00_NA.md with reason and trigger condition

8) Naming Rules (Locked)
Domain pack folder: 20_domains/<domain_slug>/
Feature pack folder: 30_features/feat_<feature_slug>/
Screen pack folder: 40_screens/scr_<screen_slug>/
Component pack folder: 50_components/cmp_<component_slug>/
Slug rules:
lowercase, underscore
deterministic from canonical IDs/names
stable across regeneration unless entity is new

9) Mutability Rules (for drift control)
Core artifacts are append-only only where specified:
06_state_snapshot.json updates over time
00_PROOF_LOG.md grows over time
Filled templates are immutable once template gate passes (policy can be enforced by packaging/gate tooling)

10) Failure Modes
inconsistent kit trees cause external agent drift
missing core artifacts causes guessing
silent omission of slot docs hides missing constraints
pack folders without meta/index/gates break navigation and auditing

11) Definition of Done (KIT-01)
KIT-01 is complete when:
root file set is locked and required
core artifacts folder required contents are locked
pack folder contract (root files + slot folders + N/A rule) is locked
naming rules for domain/feature/screen/component packs are locked
mutability expectations for state/proof are explicit and compatible with VER/STATE docs
