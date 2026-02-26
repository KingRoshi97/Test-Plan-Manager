SYS-08 — Configuration Model (Hardened Draft)
1) Purpose
Define how Axion separates:
what is fixed system law
what is configurable per project
what is versioned library content
so projects are deterministic and the system stays clean over time.

2) Configuration Layers (locked)
Layer 1 — System Contracts (Fixed)
These are non-negotiable contracts that must not vary by project:
intake schema structure contracts (field paths must remain stable across versions unless migrated)
canonical spec model contracts (ID rules, referential integrity)
kit file tree contract
gate output contract
Storage: internal system docs + version registry
Change policy: change control required
Layer 2 — Libraries (Versioned Defaults)
Reusable stores that define defaults and patterns:
Standards Library (design/security/quality/engineering rules)
Template Library (template definitions + completeness rules)
Vocabulary/Definitions Library
Examples/Reference Library (optional)
Storage: library folders + version stamps
Change policy: version bump + compatibility notes
Layer 3 — Project-Resolved Configuration (Snapshot)
Project-specific resolved results:
Resolved Standards Snapshot (defaults + overrides, pinned versions)
Template selection result (which templates apply to this project)
Any allowed project overrides recorded explicitly
Storage: inside the kit under core artifacts / stamps
Change policy: regenerated or updated via recorded override decisions
Layer 4 — Runtime/Execution State (Mutable)
Per-project, time-varying state:
State Snapshot
Proof Log
Storage: kit runtime area or external storage linked by ID
Change policy: append/update allowed; must remain auditable

3) Fixed vs Configurable (what belongs where)
Fixed (system law)
gating model and gate contracts
ID/reference rules
required artifact chain for traceability
kit layout structure and required root files
“unknown must be explicit” rule
“no duplicate truth” rule
Configurable (project-level, via standards snapshot)
tech stack choices (when not fixed globally)
UI theme/styling rules (within allowed standards)
auth method selection (within allowed security baseline)
testing depth expectations (by skill level and standards)
operational requirements (depending on deployment context)
Library-defined defaults (should not be hand-edited per project)
standard presets for each category/type/audience
template structures and required sections
vocabulary dictionaries

4) Override Rules (how config changes legally happen)
An override can only change fields marked configurable.
Each override must record:
field_path
before/after
reason
who approved
timestamp
version stamps
Overrides that attempt to change fixed rules must be blocked or routed to change control.

5) Configuration Identification (how a project is “pinned”)
A project run is defined by:
schema_version
standards_library_version
template_library_version
system_version
resolved standards snapshot hash/id
If these match, the kit should be reproducible (determinism principle).

6) Failure Modes prevented
hidden configuration that changes behavior silently
“same input, different output” due to unpinned defaults
project-level edits corrupting global standards
templates drifting without version tracking

7) Definition of Done
SYS-08 is complete when:
configuration layers are unambiguous
fixed vs configurable boundaries are explicit
override rules are aligned with SYS-07 gate override model
version pinning requirements align with SYS-06 traceability model

