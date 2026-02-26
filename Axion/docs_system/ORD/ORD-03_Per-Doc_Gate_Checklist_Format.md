ORD-03 — Per-Doc Gate Checklist (Standard Gate Format)
(Hardened Draft — Full)
1) Purpose
Define the standard way each internal doc/artifact declares its own compliance gate checklist, using the Gate DSL contract (ORD-02), so:
every doc is lockable
“no forward progress without compliance” applies consistently
gate checks are machine-readable and auditable
ORD-03 defines the format and required fields for per-doc gates.

2) Inputs
ORD-02 Gate DSL (operators + report contract)
The doc being gated (e.g., SYS-10, INT-03, TMP-04)
The doc’s Definition of Done criteria (DoD sections)

3) Outputs
A per-doc gate checklist object (stored in one of two allowed ways):
embedded at the end of the doc under a dedicated heading, and/or
stored as a separate gate file referenced by doc_id
Either way, the format must be identical.

4) Standard Gate Checklist Format (Locked)
4.1 Checklist Header (required)
doc_id
doc_version
gate_id
gate_mode (hard_stop | warn_only)
target (doc_id or artifact path)
depends_on[] (upstream doc_ids that must already be compliant)
rules[] (list of gate rules)
outputs (what artifacts/reports are produced)

4.2 Rule Entry (required)
Each rule must follow ORD-02 metadata requirements:
rule_id
description
severity (error|warning)
error_code
pointer_paths[]
expression
remediation
overridable (true|false; default false)

5) Required Rule Categories (minimum set for any doc)
Every doc’s gate checklist must include rules for:
CAT-01 Structural Completeness
required sections exist
required headings present
CAT-02 Non-ambiguity
no “should/usually/ideally” in enforceable sections (only for system-law docs; optional elsewhere)
terms used are defined or referenced (SYS-09 linking)
CAT-03 Dependency Alignment
doc does not contradict upstream dependencies (e.g., SYS-10 aligns with SYS-07)
CAT-04 Traceability / Versioning
doc declares version and lock level
references include doc_ids and versions where required
Rule: Some categories may be marked warning-only for provisional docs (e.g., SYS-09 during early drafting), but must be hard_stop at lock time.

6) Gate Location Rules (where checklist lives)
A doc’s gate checklist must appear under a fixed heading:
## Gate Checklist (ORD-03)
If stored externally, the doc must include:
Gate Checklist Ref: <path> in its header

7) How DoD maps to gate rules
DoD statements must be converted into explicit gate rules:
“All boundaries map to gates” → count(boundary_mappings) >= N
“No optional language” → pattern check (if supported) or manual checklist
If a DoD item cannot be expressed deterministically, it must be:
explicitly marked as Manual Gate Item, with a required reviewer role.

8) Manual Gate Items (allowed but controlled)
Some checks may require human review. If so:
rule entry must include manual: true
required reviewer role must be declared
pass/fail must still be recorded in gate report
Rule: manual checks must be rare for core contracts; the goal is deterministic gating.

9) Failure Modes
docs declared “locked” without passing their gate checklist
DoD remains narrative and cannot be enforced
missing depends_on causes out-of-order locking
override allowed on system-law docs (unsafe)

10) Definition of Done (ORD-03)
ORD-03 is complete when:
standard checklist format is fully specified
rule entry schema aligns with ORD-02
minimum rule categories are defined
gate location rules are explicit
DoD-to-gate mapping guidance is explicit
