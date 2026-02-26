TMP-01 — Template Types & Template Index (Registry)
(Hardened Draft — Full)
1) Purpose
Define the Template System registry so Axion can:
enumerate every template that exists
select templates deterministically based on routing + gates
support safe growth via versioning and non-redundant inventory
stamp exactly which templates/versions were used in a kit
TMP-01 defines:
the locked Template Types
the Template Index format (machine-readable registry)
minimum metadata required for selection, filling, gating, and traceability
Template file structure is TMP-02. Selection logic is TMP-03. Fill rules are TMP-04. Completeness is TMP-05.

2) Inputs
Locked template types list (merged types)
Standards snapshot contract (what templates can reference)
Canonical spec model (what templates can reference)
Governance/versioning policy (library versioning discipline)

3) Outputs
A versioned Template Library containing:
template files (markdown templates)
a machine-readable Template Index registry
a library version stamp
The Template Index is the authoritative inventory the internal agent uses.

4) Template Types (Locked Set)
These are the only allowed template types:
Product / Requirements
Design
Architecture
Implementation (includes planning)
Security & Access
Quality (includes a11y verification + performance checks)
Operations (includes runbooks/incident process)
Data (conditional)
API / Interface Contracts (conditional)
Release (conditional)
Governance / Change Control (conditional)
Analytics / Telemetry (conditional)
Rule: New types require change control and Template Index schema version bump.

5) Template Index Contract (Machine-Readable Registry)
5.1 Template Index File
File name (canonical): template_index.json
Required top-level fields:
template_library_version
template_index_version
generated_at
templates[]

5.2 Template Entry Contract
Each template entry in templates[] must include:
Identity
template_id (stable, unique; e.g., PRD-01, DES-04)
title
type (one of the 12 template types)
template_version (semantic or numeric)
file_path (within template library)
status (enum): draft | active | deprecated
Applicability (selection filters)
applies_when (object; deterministic filter set)
routing filters:
category[] (optional list)
type_preset[] (optional list)
audience_context[] (optional list)
build_target[] (optional list)
skill_level[] (optional list) (rare; typically affects requiredness, not selection)
gates filters:
requires_data_enabled (boolean|null)
requires_auth_required (boolean|null)
requires_integrations_enabled (boolean|null)
conditions (optional explicit boolean expressions if you support; otherwise omit)
Requiredness (how strongly it is enforced)
requiredness (enum):
always
conditional
optional
required_by_skill_level (object):
{ beginner: required|optional|omit, intermediate: required|optional|omit, expert: required|optional|omit }
Inputs (what it needs to fill)
inputs_required[] (list of data sources/paths)
must reference known sources:
canonical spec paths
standards snapshot paths
work breakdown paths
acceptance map paths
derived_inputs[] (optional list)
computed relationships needed (feature→workflows, etc.)
Outputs (what it produces in the kit)
output_path (where the filled doc goes in kit)
output_artifact_id (optional stable id for manifest indexing)
Upstream Dependencies (doc gating)
upstream_dependencies[] (list of artifact/template IDs that must be valid first)
examples: STD-03 snapshot must exist, canonical spec must exist, etc.
Compliance Gate Metadata
compliance_gate_id (string; points to TMP-05 rule set)
compliance_requirements (optional structured list of checks)
Cross-References (linking discipline)
references_entities[] (list of canonical entity types it references: roles, features, workflows, etc.)
no_duplicate_truth (boolean; must be true for all templates)

6) Template Library Versioning Rules (registry-level)
6.1 Library version
template_library_version must change when:
a template is added/removed
a template structure changes materially
requiredness rules change materially
selection filters change materially
6.2 Template version
template_version must change when:
template content structure changes
required fields change
placeholder variables change
6.3 Deprecation
Deprecated templates remain in index with:
status: deprecated
deprecated_at
replacement_template_id (if any)

7) Invariants (must always be true)
Every template file must have a Template Index entry.
No Template Index entry may point to a missing file.
template_id is unique across the library.
type must be one of the locked types.
applies_when must be deterministic and not ambiguous.
required_by_skill_level must be present for every template.
output_path must conform to the kit file tree contract (KIT docs).
no_duplicate_truth must be true for all templates.

8) Failure Modes
templates exist but aren’t indexed (unselectable, inconsistent kits)
ambiguous applies_when filters (non-deterministic selection)
requiredness missing (agents don’t know what to enforce)
output_path inconsistent with kit layout (packaging break)
stale index version with changed files (drift)

9) Definition of Done (TMP-01)
TMP-01 is complete when:
template types are locked
Template Index JSON contract is fully specified
template entry schema covers: identity, applicability, requiredness, inputs/outputs, dependencies, compliance metadata
versioning/deprecation rules are explicit
invariants are enforceable via gates

