TMP-06 — Pack Hierarchy & Placement Contract (Outline + One End-to-End Path)
1) Purpose
Define the locked standard layout for how filled templates are packaged into a kit, across the hierarchy:
App → Domain → Feature → Screen → Component, so the agent always knows:
where to find things
what’s required at each level
how variability is expressed (filled vs N/A)

2) Core Concepts (locked)
2.1 Pack Levels
APP Pack (entire product)
DOMAIN Pack (major system area: Frontend/Backend/Data/Security/Ops/etc.)
FEATURE Pack (capability slice)
SCREEN Pack (UI surface for a workflow step)
COMPONENT Pack (reusable UI building block; only when promoted)
2.2 Template Slots (universal categories)
Every pack uses the same slot folders (even if empty):
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
Rule: If a slot isn’t applicable, it must contain 00_NA.md with reason.

3) Pack Root Required Files (locked)
Every pack folder must include:
00_pack_meta.md (required)
pack_level: APP/DOMAIN/FEATURE/SCREEN/COMPONENT
pack_id (stable)
scope_refs[] (canonical spec IDs included)
required_slots[] (computed)
upstream_deps[] (pack-level dependencies)
status (draft/complete)
version stamps
00_pack_index.md (required)
table of contents (links to files)
“what to read first” for this pack
00_gate_checklist.md (required)
pass/fail checklist for this pack being “complete”
references Acceptance Map IDs if relevant

4) Required Slots by Pack Level (locked minimums)
4.1 APP Pack (minimum required slots)
Requirements, Design, Architecture, Implementation, Security, Quality
Data/API/ops/release/governance/analytics are conditional
4.2 DOMAIN Pack (minimum required slots)
Architecture, Implementation, Quality
Security conditional (if domain touches auth/data/control)
Design conditional (frontend domain)
Ops conditional (ops domain / deploy concerns)
4.3 FEATURE Pack (minimum required slots)
Requirements slice, Implementation slice, Quality slice
Data/API/Security conditional
4.4 SCREEN Pack (minimum required slots)
Design (screen layout), Quality (screen checks)
Security conditional (access rules)
Implementation optional (if screen has tricky behavior)
4.5 COMPONENT Pack (minimum required slots)
Design (component rules), Quality (a11y/tests)
Implementation optional

5) Template Placement Rules (locked)
5.1 One Source of Truth
Templates must reference canonical IDs; no redefining features/roles/workflows.
5.2 Where templates live
Product/Requirements templates go in 01_requirements/
Design templates go in 02_design/
Architecture templates go in 03_architecture/
Implementation templates go in 04_implementation/
Security templates go in 05_security/
Quality templates go in 06_quality/
Operations templates go in 07_ops/
Data templates go in 08_data/
API/Interface templates go in 09_api_contracts/
Release templates go in 10_release/
Governance templates go in 11_governance/
Analytics templates go in 12_analytics/
5.3 N/A rule (no silent omissions)
If a slot has no applicable templates:
create 00_NA.md with:
“Why N/A”
what would have triggered it
who decided (system default vs user decision)

6) End-to-End Example Path (locked “one path”)
This is the canonical sequence of packs the internal agent must be able to generate for a typical app feature.
Example Path: APP → Frontend Domain → Feature → Screen → Component
A) APP Pack
/kit/app/
00_pack_meta.md
00_pack_index.md
00_gate_checklist.md
01_requirements/
PRD-01, PRD-02, PRD-03, PRD-04, PRD-05, PRD-06
02_design/
DES-01, DES-02, DES-03
03_architecture/
ARC-01, ARC-02, ARC-03, ARC-04
04_implementation/
IMP-01, IMP-02, IMP-03, IMP-04
05_security/
SEC-01, SEC-02, SEC-03, SEC-05
06_quality/
QA-01, QA-02, QA-03, QA-04
Conditional slots: 08_data/, 09_api_contracts/, etc. (filled or N/A)
B) DOMAIN Pack (Frontend)
/kit/domains/frontend/
pack root files (meta/index/gate)
02_design/
DES-04 (screen specs set)
DES-05 (states/motion)
DES-06 (a11y requirements)
04_implementation/
IMP-05 (frontend slice guide)
06_quality/
QA-06 (a11y verification)
QA-04 (frontend regression checklist slice)
non-applicable slots have 00_NA.md
C) FEATURE Pack (Task CRUD)
/kit/features/feat_task_crud/
pack root files (meta/index/gate)
01_requirements/
PRD-03 feature excerpt (or feature slice doc)
PRD-04 workflow excerpt(s)
02_design/ (optional but common)
links to relevant screen specs
04_implementation/
IMP-05 Feature Slice Implementation Guide (task CRUD)
06_quality/
QA-01 acceptance items for this feature
QA-03 proof requirements for this feature
08_data/ (if introduces/uses Task entity)
DATA-02 excerpt for Task
09_api_contracts/ (if has endpoints)
API-02 excerpt for /tasks
D) SCREEN Pack (Task List Screen)
/kit/screens/scr_task_list/
pack root files (meta/index/gate)
02_design/
DES-04 screen layout spec (Task List)
05_security/ (conditional)
access rules (role access summary)
06_quality/
screen acceptance checks (states, behaviors, a11y)
E) COMPONENT Pack (TaskCard)
/kit/components/cmp_task_card/
pack root files (meta/index/gate)
02_design/
component usage rules (variants, props, do/don’t)
06_quality/
a11y + render-state checks

7) Completion Definition (locked)
A pack is “complete” when:
required root files exist
required slots for that pack level are filled or explicitly N/A
all templates inside pass their own completeness gates
pack gate checklist passes

If you want, next we can write the exact file tree standard (the literal folder names and naming rules) as the final “locked layout” version.
