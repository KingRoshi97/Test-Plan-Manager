KIT-02 — Manifest/Index Format (IDs → Paths, Reading Order)
(Hardened Draft — Full)
1) Purpose
Define the Kit Manifest and Index contracts so every kit can be navigated deterministically by:
machines (agents, validators, packagers)
humans (you auditing or reading)
KIT-02 defines:
the machine-readable manifest format (authoritative IDs → paths)
the human-readable index format (mirrors manifest)
reading order rules (what to read first, then next)

2) Inputs
Kit folder structure (KIT-01)
Core artifact IDs (submission_id/spec_id/work_breakdown_id/acceptance_map_id)
Template Selection Result (TMP-03)
Filled template outputs + their output paths
Pack folders and their meta/index/gate files

3) Outputs
Two required root files:
00_KIT_MANIFEST.md (machine-readable block required)
00_KIT_INDEX.md (human-friendly table of contents)
Both must be consistent. If inconsistent → Packaging Gate fails.

4) Manifest Contract (Authoritative)
4.1 File: 00_KIT_MANIFEST.md
Must contain two parts in this order:
A) Manifest Header (required)
kit_id
created_at
submission_id
spec_id
work_breakdown_id
acceptance_map_id
state_id
schema_version_used
standards_version_used
template_library_version_used
system_version
B) Manifest Body (required; machine-readable)
A fenced JSON block named manifest:
{
  "manifest_version": "v1",
  "reading_order": ["00_START_HERE.md", "..."],
  "core_artifacts": {
    "normalized_input": "01_core_artifacts/01_normalized_input_record.json",
    "standards_snapshot": "01_core_artifacts/02_resolved_standards_snapshot.json",
    "canonical_spec": "01_core_artifacts/03_canonical_spec.json",
    "work_breakdown": "01_core_artifacts/04_work_breakdown.json",
    "acceptance_map": "01_core_artifacts/05_acceptance_map.json",
    "state_snapshot": "01_core_artifacts/06_state_snapshot.json"
  },
  "packs": {
    "app": "10_app/",
    "domains": ["20_domains/frontend/", "20_domains/backend/"],
    "features": ["30_features/feat_task_crud/"],
    "screens": ["40_screens/scr_task_list/"],
    "components": ["50_components/cmp_task_card/"]
  },
  "docs": [
    { "doc_id": "PRD-01", "path": "10_app/01_requirements/PRD-01_Product_Requirements_Document.md" },
    { "doc_id": "DES-04", "path": "10_app/02_design/DES-04_Screen_Layout_Specs.md" }
  ],
  "proof": {
    "proof_log": "00_PROOF_LOG.md"
  },
  "run_rules": "00_RUN_RULES.md",
  "versions": "00_VERSIONS.md"
}

Rule: The JSON block is the authoritative mapping; the markdown around it is commentary.

4.2 Required Manifest Fields (locked)
manifest_version
reading_order[]
core_artifacts map (must include all required core artifacts)
packs lists (may be empty lists but keys must exist)
docs[] list with doc_id and path
proof.proof_log
run_rules
versions

4.3 Reading Order Rules (locked)
reading_order[] must always begin with:
00_START_HERE.md
00_KIT_MANIFEST.md
01_core_artifacts/02_resolved_standards_snapshot.json
01_core_artifacts/03_canonical_spec.json
01_core_artifacts/04_work_breakdown.json
01_core_artifacts/05_acceptance_map.json
01_core_artifacts/06_state_snapshot.json
After core artifacts, the order may list:
app-level filled docs in template type order (Product → Design → Architecture → …)
then domain packs
then feature packs
then screen packs
then component packs
Rule: reading_order must be deterministic and must not omit core artifacts.

4.4 Doc ID Rules
doc_id must match Template Index template_id for filled templates.
Pack root docs may use reserved IDs:
PACK_META, PACK_INDEX, PACK_GATE

5) Index Contract (Human-Friendly)
5.1 File: 00_KIT_INDEX.md
Must include:
A) Quick Start
link to 00_START_HERE.md
link to core artifacts
B) Core Artifacts Links
List the six core artifacts with paths.
C) Filled Docs Table of Contents
Organize by:
App-level docs (by template type)
Domain packs
Feature packs
Screen packs
Component packs
Rule: The index must not list anything that isn’t in the manifest JSON, and must list everything the manifest includes (at least as a link group).

6) Consistency Rules (Manifest ↔ Index)
KIT2-CON-01
Every docs[].path in manifest must appear in index.
KIT2-CON-02
Every link listed in index must exist in manifest (or be a pack folder path listed under packs).
KIT2-CON-03
All referenced paths must exist in the kit file tree.
Violations → Packaging Gate failure.

7) Failure Modes
missing reading order causes external agent confusion
index differs from manifest (two truths)
doc_id doesn’t match template_id (breaks automation)
paths don’t exist (broken kit)

8) Definition of Done (KIT-02)
KIT-02 is complete when:
manifest header fields are defined
manifest JSON contract is fully specified
reading order rules are locked
index structure is defined and mirrors manifest
consistency rules are explicit and gateable
