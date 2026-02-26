GOV-01 — Versioning Policy
(Hardened Draft — Full)
1) Purpose
Define the strict versioning rules that keep Axion stable and reproducible over time, including:
what is versioned
when versions must change
how versions are recorded in kits
what counts as breaking vs non-breaking change
how compatibility is maintained across system upgrades

2) Inputs
System boundaries (SYS-10) — no uncontrolled evolution
Traceability model (SYS-06) — provenance and stamps
Kit version stamping (KIT-04)
Library structures (STD-01, TMP-01)
Canonical model evolution rules (CAN-01/02/03)

3) Outputs
A locked policy that governs versioning for:
system docs/contracts
standards library
template library
intake schema and rules
canonical model
kit contracts
generated artifacts (as stamped outputs)

4) Versioning Invariants (must always be true)
No silent change: any change that affects behavior/output must change a version stamp.
Pinned outputs: every kit records versions required to reproduce generation (KIT-04).
Compatibility declared: breaking changes require compatibility notes/migrations.
Scope-appropriate versioning: libraries and contracts version separately (no single giant version for everything).
Determinism preserved: versions exist to explain output differences.

5) Versioned Surfaces (What MUST be versioned)
V-SURF-01 System Version
Covers: SYS/ORD/GOV/EXEC contract docs and system-wide behavior.
system_version
V-SURF-02 Intake Versions
form_version
schema_version
int_ruleset_version (INT-03)
V-SURF-03 Standards Library Versions
standards_library_version
per-pack versions (pack_id@pack_version)
resolver ruleset version (STD-02)
V-SURF-04 Template Library Versions
template_library_version
per-template versions (template_id@template_version)
template index version (TMP-01)
fill rules version (TMP-04)
V-SURF-05 Canonical Model Versions
canonical spec model version (CAN-01/02/03)
ID rules version (CAN-02)
unknown model version (CAN-03)
V-SURF-06 Planning & Proof Versions
planning rules version (PLAN-01/02/03)
proof rules version (VER-01/02/03)
V-SURF-07 Kit Contract Versions
kit folder structure version (KIT-01)
manifest format version (KIT-02)
entrypoint contract version (KIT-03)

6) When Versions MUST Change (Trigger Rules)
6.1 System version triggers
System version must change when:
pipeline stage behavior changes
gate DSL/rules change (ORD-02/03)
system boundaries change (SYS-10)
any contract that affects generation semantics changes
6.2 Intake version triggers
form_version changes when UI fields/pages change.
schema_version changes when field paths/types/base constraints change.
int_ruleset_version changes when dependency/threshold logic changes (INT-03).
6.3 Standards version triggers
standards library version changes when:
packs added/removed
applies_when filters change
rule defaults/constraints change
pack_version changes when any rule inside pack changes.
6.4 Template version triggers
template_library_version changes when:
templates added/removed
template applies_when/requiredness changes
template index schema changes
template_version changes when:
template structure changes
required fields change
placeholders change
output format changes materially
6.5 Canonical model triggers
canonical model version changes when:
entity shape changes
reference rules change
ID rules change
unknown model changes
6.6 Kit contract triggers
kit structure version changes when:
required root files change
paths for core artifacts change
pack folder contract changes
manifest version changes when JSON schema changes
entrypoint contract version changes when required sections/order changes

7) Breaking vs Non-Breaking Changes (Locked Definitions)
7.1 Breaking change
A change is breaking if it causes:
old kits to be unreadable by the runner/builder
old manifests/indexes to be incompatible
canonical spec references to no longer resolve
template filler to fail on old templates/specs without migration
Breaking changes require:
version bump
compatibility notes
migration guidance (GOV-03)
7.2 Non-breaking change
A change is non-breaking if:
it is additive (new optional fields) and defaults preserve meaning
old kits still run without reinterpretation
no required paths/fields change
Still requires version bump if behavior/output changes.

8) Version Recording Rules
all relevant versions must be stamped into:
00_VERSIONS.md (KIT-04)
00_KIT_MANIFEST.md (KIT-02)
standards snapshot (STD-03 includes pack versions)
template selection result (if stored)

9) Failure Modes
outputs change but version didn’t → impossible to audit
breaking change without migration notes → older kits become unusable
single “global version only” → cannot isolate what changed
versions recorded inconsistently across manifest/snapshot/versions file

10) Definition of Done (GOV-01)
GOV-01 is complete when:
versioned surfaces are enumerated
version bump triggers are explicit per surface
breaking vs non-breaking definitions are locked
recording rules align with KIT-04 and STD-03
policy prevents silent changes under SYS-10 B-08
